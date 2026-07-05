#!/usr/bin/env python3
"""
File Watcher for clients.json
Monitors changes to clients.json and syncs data to Supabase via REST API
"""

import json
import os
import time
from datetime import datetime
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import requests
from typing import Dict, Any, Optional


class SupabaseClient:
    """Supabase REST API Client"""
    
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.headers = {
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    
    def upsert_client(self, client_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert or update client data in Supabase"""
        try:
            table_name = 'clients'
            endpoint = f"{self.url}/rest/v1/{table_name}"
            
            response = requests.post(
                endpoint,
                headers=self.headers,
                json=client_data
            )
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                print(f"Error upserting client: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Exception upserting client: {e}")
            return None
    
    def sync_clients(self, clients: list) -> bool:
        """Sync multiple clients to Supabase"""
        success_count = 0
        for client in clients:
            result = self.upsert_client(client)
            if result:
                success_count += 1
        
        print(f"Synced {success_count}/{len(clients)} clients to Supabase")
        return success_count == len(clients)


class ClientFileHandler(FileSystemEventHandler):
    """Handler for clients.json file changes"""
    
    def __init__(self, supabase_client: SupabaseClient):
        self.supabase_client = supabase_client
        self.last_modified = 0
        self.debounce_seconds = 2  # Prevent rapid successive syncs
    
    def on_modified(self, event):
        """Called when file is modified"""
        if event.src_path.endswith('clients.json'):
            current_time = time.time()
            
            # Debounce to prevent multiple syncs for rapid changes
            if current_time - self.last_modified < self.debounce_seconds:
                return
            
            self.last_modified = current_time
            print(f"\n[{datetime.now().isoformat()}] clients.json modified")
            self.sync_to_supabase(event.src_path)
    
    def sync_to_supabase(self, file_path: str):
        """Read clients.json and sync to Supabase"""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            clients = data.get('clients', [])
            if not clients:
                print("No clients found in file")
                return
            
            print(f"Found {len(clients)} clients to sync")
            self.supabase_client.sync_clients(clients)
            
            # Update metadata
            metadata = data.get('metadata', {})
            metadata['last_sync'] = datetime.now().isoformat()
            
            # Optionally write back updated metadata
            # with open(file_path, 'w') as f:
            #     data['metadata'] = metadata
            #     json.dump(data, f, indent=2)
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
        except Exception as e:
            print(f"Error syncing to Supabase: {e}")


def load_config() -> Dict[str, str]:
    """Load configuration from environment variables"""
    config = {
        'supabase_url': os.getenv('SUPABASE_URL'),
        'supabase_key': os.getenv('SUPABASE_KEY'),
        'watch_path': os.getenv('WATCH_PATH', os.getcwd())
    }
    
    if not config['supabase_url'] or not config['supabase_key']:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")
    
    return config


def main():
    """Main entry point"""
    print("Starting clients.json Watcher")
    
    try:
        config = load_config()
        
        # Initialize Supabase client
        supabase = SupabaseClient(config['supabase_url'], config['supabase_key'])
        
        # Initialize file handler
        event_handler = ClientFileHandler(supabase)
        
        # Setup file watcher
        observer = Observer()
        observer.schedule(event_handler, config['watch_path'], recursive=False)
        observer.start()
        
        print(f"Watching {config['watch_path']}/clients.json for changes...")
        print("Press Ctrl+C to stop")
        
        # Initial sync on startup
        clients_file = os.path.join(config['watch_path'], 'clients.json')
        if os.path.exists(clients_file):
            print("Performing initial sync...")
            event_handler.sync_to_supabase(clients_file)
        
        # Keep running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
            print("\nWatcher stopped")
        
        observer.join()
        
    except Exception as e:
        print(f"Error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
