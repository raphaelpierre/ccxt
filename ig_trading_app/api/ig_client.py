"""
IG Markets API Client
Handles authentication and trading operations with IG Markets REST API
"""
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple


class IGClient:
    """Client for IG Markets REST Trading API"""

    def __init__(self, api_key: str, username: str, password: str, demo: bool = True):
        """
        Initialize IG Markets API client

        Args:
            api_key: Your IG API key
            username: IG account username
            password: IG account password
            demo: Use demo account (default True)
        """
        self.api_key = api_key
        self.username = username
        self.password = password
        self.demo = demo

        # API endpoints
        self.base_url = "https://demo-api.ig.com/gateway/deal" if demo else "https://api.ig.com/gateway/deal"

        # Session management
        self.session_token = None
        self.cst_token = None
        self.account_id = None
        self.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-IG-API-KEY': self.api_key,
            'Version': '2'
        }

    def authenticate(self) -> bool:
        """
        Authenticate with IG Markets API

        Returns:
            bool: True if authentication successful
        """
        url = f"{self.base_url}/session"
        payload = {
            "identifier": self.username,
            "password": self.password
        }

        try:
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()

            # Store session tokens
            self.cst_token = response.headers.get('CST')
            self.session_token = response.headers.get('X-SECURITY-TOKEN')

            # Get account info
            data = response.json()
            self.account_id = data.get('currentAccountId')

            # Update headers with tokens
            self.headers['CST'] = self.cst_token
            self.headers['X-SECURITY-TOKEN'] = self.session_token

            print(f"✓ Authenticated successfully - Account: {self.account_id}")
            return True

        except requests.exceptions.RequestException as e:
            print(f"✗ Authentication failed: {e}")
            return False

    def get_accounts(self) -> List[Dict]:
        """Get all trading accounts"""
        url = f"{self.base_url}/accounts"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json().get('accounts', [])

    def get_positions(self) -> List[Dict]:
        """
        Get all open positions

        Returns:
            List of open positions with details
        """
        url = f"{self.base_url}/positions"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json().get('positions', [])

    def get_market_info(self, epic: str) -> Dict:
        """
        Get market information for a specific instrument

        Args:
            epic: Market epic code (e.g., 'CS.D.EURUSD.CFD.IP')
        """
        url = f"{self.base_url}/markets/{epic}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def create_position(
        self,
        epic: str,
        direction: str,
        size: float,
        stop_level: Optional[float] = None,
        stop_distance: Optional[float] = None,
        profit_level: Optional[float] = None,
        profit_distance: Optional[float] = None,
        trailing_stop: bool = False,
        trailing_stop_increment: Optional[float] = None,
        force_open: bool = True
    ) -> Dict:
        """
        Create a new position with optional TP/SL

        Args:
            epic: Market epic code
            direction: 'BUY' or 'SELL'
            size: Position size
            stop_level: Absolute stop loss level
            stop_distance: Stop loss distance from entry
            profit_level: Absolute take profit level
            profit_distance: Take profit distance from entry
            trailing_stop: Enable trailing stop
            trailing_stop_increment: Trailing stop increment
            force_open: Force open new position even if one exists

        Returns:
            Deal reference response
        """
        url = f"{self.base_url}/positions/otc"

        payload = {
            "epic": epic,
            "expiry": "-",
            "direction": direction,
            "size": str(size),
            "orderType": "MARKET",
            "timeInForce": "FILL_OR_KILL",
            "guaranteedStop": False,
            "forceOpen": force_open
        }

        # Add stop loss
        if stop_level is not None:
            payload["stopLevel"] = str(stop_level)
        elif stop_distance is not None:
            payload["stopDistance"] = str(stop_distance)

        # Add take profit
        if profit_level is not None:
            payload["limitLevel"] = str(profit_level)
        elif profit_distance is not None:
            payload["limitDistance"] = str(profit_distance)

        # Add trailing stop
        if trailing_stop and trailing_stop_increment:
            payload["trailingStop"] = True
            payload["trailingStopIncrement"] = str(trailing_stop_increment)

        headers = self.headers.copy()
        headers['Version'] = '2'

        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()

        return response.json()

    def update_position(
        self,
        deal_id: str,
        stop_level: Optional[float] = None,
        profit_level: Optional[float] = None,
        trailing_stop: bool = False,
        trailing_stop_distance: Optional[float] = None,
        trailing_stop_increment: Optional[float] = None
    ) -> Dict:
        """
        Update TP/SL on an existing position

        Args:
            deal_id: Position deal ID
            stop_level: New stop loss level
            profit_level: New take profit level
            trailing_stop: Enable trailing stop
            trailing_stop_distance: Trailing stop distance
            trailing_stop_increment: Trailing stop increment
        """
        url = f"{self.base_url}/positions/otc/{deal_id}"

        payload = {}

        if stop_level is not None:
            payload["stopLevel"] = str(stop_level)

        if profit_level is not None:
            payload["limitLevel"] = str(profit_level)

        if trailing_stop:
            payload["trailingStop"] = True
            if trailing_stop_distance:
                payload["trailingStopDistance"] = str(trailing_stop_distance)
            if trailing_stop_increment:
                payload["trailingStopIncrement"] = str(trailing_stop_increment)

        headers = self.headers.copy()
        headers['Version'] = '2'
        headers['_method'] = 'PUT'

        response = requests.put(url, json=payload, headers=headers)
        response.raise_for_status()

        return response.json()

    def close_position(
        self,
        deal_id: str,
        direction: str,
        size: float
    ) -> Dict:
        """
        Close an existing position

        Args:
            deal_id: Position deal ID
            direction: 'BUY' or 'SELL' (opposite of opening direction)
            size: Size to close
        """
        url = f"{self.base_url}/positions/otc"

        payload = {
            "dealId": deal_id,
            "direction": direction,
            "orderType": "MARKET",
            "size": str(size),
            "timeInForce": "FILL_OR_KILL"
        }

        headers = self.headers.copy()
        headers['Version'] = '1'
        headers['_method'] = 'DELETE'

        response = requests.delete(url, json=payload, headers=headers)
        response.raise_for_status()

        return response.json()

    def partial_close_position(
        self,
        deal_id: str,
        direction: str,
        size: float,
        new_stop_level: Optional[float] = None,
        new_profit_level: Optional[float] = None
    ) -> Tuple[Dict, Optional[Dict]]:
        """
        Partially close a position and optionally update remaining TP/SL

        Args:
            deal_id: Position deal ID
            direction: Close direction
            size: Size to close (partial)
            new_stop_level: New SL for remaining position
            new_profit_level: New TP for remaining position

        Returns:
            Tuple of (close_response, update_response)
        """
        # Close partial position
        close_response = self.close_position(deal_id, direction, size)

        # Update remaining position if new levels provided
        update_response = None
        if new_stop_level or new_profit_level:
            update_response = self.update_position(
                deal_id,
                stop_level=new_stop_level,
                profit_level=new_profit_level
            )

        return close_response, update_response

    def search_markets(self, search_term: str) -> List[Dict]:
        """
        Search for markets/instruments

        Args:
            search_term: Search query
        """
        url = f"{self.base_url}/markets"
        params = {'searchTerm': search_term}

        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()

        return response.json().get('markets', [])

    def get_deal_confirmation(self, deal_reference: str) -> Dict:
        """
        Get confirmation details for a deal

        Args:
            deal_reference: Deal reference from position creation/closure
        """
        url = f"{self.base_url}/confirms/{deal_reference}"

        headers = self.headers.copy()
        headers['Version'] = '1'

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        return response.json()
