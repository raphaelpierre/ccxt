"""
IG Trading App - Flask Backend
Web application for managing TP/SL orders on IG Markets
"""
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from api.ig_client import IGClient
import json
import os
from datetime import datetime
from typing import Dict, List, Optional


app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(app)

# Global IG client instance
ig_client: Optional[IGClient] = None

# Store for multiple TP levels configuration
tp_configs = {}


@app.route('/')
def index():
    """Render main trading interface"""
    return render_template('index.html')


@app.route('/api/authenticate', methods=['POST'])
def authenticate():
    """
    Authenticate with IG Markets API

    Body:
        api_key: str
        username: str
        password: str
        demo: bool (optional, default True)
    """
    global ig_client

    try:
        data = request.get_json()
        api_key = data.get('api_key')
        username = data.get('username')
        password = data.get('password')
        demo = data.get('demo', True)

        if not all([api_key, username, password]):
            return jsonify({'error': 'Missing credentials'}), 400

        # Create and authenticate client
        ig_client = IGClient(api_key, username, password, demo)
        success = ig_client.authenticate()

        if success:
            session['authenticated'] = True
            session['account_id'] = ig_client.account_id
            return jsonify({
                'success': True,
                'account_id': ig_client.account_id,
                'demo': demo
            })
        else:
            return jsonify({'error': 'Authentication failed'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/positions', methods=['GET'])
def get_positions():
    """Get all open positions"""
    if not ig_client:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        positions = ig_client.get_positions()
        return jsonify({'positions': positions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/markets/search', methods=['GET'])
def search_markets():
    """Search for markets/instruments"""
    if not ig_client:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        search_term = request.args.get('q', '')
        if not search_term:
            return jsonify({'error': 'Search term required'}), 400

        markets = ig_client.search_markets(search_term)
        return jsonify({'markets': markets})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/markets/<epic>', methods=['GET'])
def get_market_info(epic):
    """Get market information"""
    if not ig_client:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        market = ig_client.get_market_info(epic)
        return jsonify(market)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/positions/create', methods=['POST'])
def create_position():
    """
    Create new position with automatic TP/SL

    Body:
        epic: str - Market epic
        direction: str - BUY or SELL
        size: float - Position size
        stop_loss: dict (optional)
            type: 'level' or 'distance'
            value: float
        take_profit: list or dict (optional)
            For single TP: {type: 'level'/'distance', value: float}
            For multiple TPs: [{level: float, size_percentage: float}, ...]
        trailing_stop: dict (optional)
            enabled: bool
            distance: float
            increment: float
    """
    if not ig_client:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        data = request.get_json()

        epic = data.get('epic')
        direction = data.get('direction')
        size = float(data.get('size'))

        if not all([epic, direction, size]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Parse stop loss
        stop_level = None
        stop_distance = None
        if 'stop_loss' in data:
            sl = data['stop_loss']
            if sl.get('type') == 'level':
                stop_level = float(sl['value'])
            elif sl.get('type') == 'distance':
                stop_distance = float(sl['value'])

        # Parse trailing stop
        trailing_stop = False
        trailing_stop_increment = None
        if 'trailing_stop' in data and data['trailing_stop'].get('enabled'):
            trailing_stop = True
            trailing_stop_increment = float(data['trailing_stop'].get('increment', 10))

        # Parse take profit
        take_profit_levels = data.get('take_profit', [])

        # Check if multiple TPs
        if isinstance(take_profit_levels, list) and len(take_profit_levels) > 1:
            # Multiple TPs - use first TP for initial order
            first_tp = take_profit_levels[0]
            profit_level = float(first_tp['level'])

            # Create initial position with first TP
            response = ig_client.create_position(
                epic=epic,
                direction=direction,
                size=size,
                stop_level=stop_level,
                stop_distance=stop_distance,
                profit_level=profit_level,
                trailing_stop=trailing_stop,
                trailing_stop_increment=trailing_stop_increment
            )

            # Store remaining TPs for this position
            deal_ref = response.get('dealReference')
            tp_configs[deal_ref] = {
                'epic': epic,
                'direction': direction,
                'original_size': size,
                'remaining_tps': take_profit_levels[1:],
                'current_tp_index': 0
            }

            return jsonify({
                'success': True,
                'dealReference': deal_ref,
                'multiple_tps': True,
                'tp_count': len(take_profit_levels)
            })

        else:
            # Single TP
            profit_level = None
            profit_distance = None

            if isinstance(take_profit_levels, dict):
                tp = take_profit_levels
                if tp.get('type') == 'level':
                    profit_level = float(tp['value'])
                elif tp.get('type') == 'distance':
                    profit_distance = float(tp['value'])
            elif isinstance(take_profit_levels, list) and len(take_profit_levels) == 1:
                profit_level = float(take_profit_levels[0]['level'])

            # Create position
            response = ig_client.create_position(
                epic=epic,
                direction=direction,
                size=size,
                stop_level=stop_level,
                stop_distance=stop_distance,
                profit_level=profit_level,
                profit_distance=profit_distance,
                trailing_stop=trailing_stop,
                trailing_stop_increment=trailing_stop_increment
            )

            return jsonify({
                'success': True,
                'dealReference': response.get('dealReference')
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/positions/<deal_id>/update', methods=['PUT'])
def update_position(deal_id):
    """
    Update TP/SL on existing position

    Body:
        stop_level: float (optional)
        profit_level: float (optional)
        trailing_stop: dict (optional)
            enabled: bool
            distance: float
            increment: float
    """
    if not ig_client:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        data = request.get_json()

        stop_level = data.get('stop_level')
        profit_level = data.get('profit_level')

        # Parse trailing stop
        trailing_stop = False
        trailing_stop_distance = None
        trailing_stop_increment = None

        if 'trailing_stop' in data and data['trailing_stop'].get('enabled'):
            trailing_stop = True
            trailing_stop_distance = data['trailing_stop'].get('distance')
            trailing_stop_increment = data['trailing_stop'].get('increment')

        response = ig_client.update_position(
            deal_id=deal_id,
            stop_level=float(stop_level) if stop_level else None,
            profit_level=float(profit_level) if profit_level else None,
            trailing_stop=trailing_stop,
            trailing_stop_distance=float(trailing_stop_distance) if trailing_stop_distance else None,
            trailing_stop_increment=float(trailing_stop_increment) if trailing_stop_increment else None
        )

        return jsonify({'success': True, 'response': response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/positions/<deal_id>/close', methods=['DELETE'])
def close_position(deal_id):
    """
    Close position

    Body:
        direction: str - BUY or SELL (opposite of opening)
        size: float (optional) - Full size if not specified
    """
    if not ig_client:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        data = request.get_json()
        direction = data.get('direction')

        # Get position to determine size
        positions = ig_client.get_positions()
        position = next((p for p in positions if p['position']['dealId'] == deal_id), None)

        if not position:
            return jsonify({'error': 'Position not found'}), 404

        size = float(data.get('size', position['position']['size']))

        response = ig_client.close_position(deal_id, direction, size)

        return jsonify({'success': True, 'dealReference': response.get('dealReference')})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/positions/<deal_id>/partial-close', methods=['POST'])
def partial_close_position(deal_id):
    """
    Partially close position (for multiple TPs)

    Body:
        direction: str - BUY or SELL
        size: float - Size to close
        new_stop_level: float (optional)
        new_profit_level: float (optional)
    """
    if not ig_client:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        data = request.get_json()
        direction = data.get('direction')
        size = float(data.get('size'))
        new_stop_level = data.get('new_stop_level')
        new_profit_level = data.get('new_profit_level')

        close_resp, update_resp = ig_client.partial_close_position(
            deal_id=deal_id,
            direction=direction,
            size=size,
            new_stop_level=float(new_stop_level) if new_stop_level else None,
            new_profit_level=float(new_profit_level) if new_profit_level else None
        )

        return jsonify({
            'success': True,
            'close_reference': close_resp.get('dealReference'),
            'updated': update_resp is not None
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/deals/<deal_reference>/confirm', methods=['GET'])
def get_deal_confirmation(deal_reference):
    """Get deal confirmation details"""
    if not ig_client:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        confirmation = ig_client.get_deal_confirmation(deal_reference)
        return jsonify(confirmation)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    """Get all trading accounts"""
    if not ig_client:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        accounts = ig_client.get_accounts()
        return jsonify({'accounts': accounts})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    """Get connection status"""
    return jsonify({
        'authenticated': ig_client is not None,
        'account_id': ig_client.account_id if ig_client else None
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
