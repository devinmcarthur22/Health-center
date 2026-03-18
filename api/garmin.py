from http.server import BaseHTTPRequestHandler
import json
import os
from datetime import date

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self._cors()
        self.end_headers()

        email    = os.environ.get('GARMIN_EMAIL', '')
        password = os.environ.get('GARMIN_PASSWORD', '')

        if not email or not password:
            self._write({'ok': False, 'error': 'Garmin credentials not configured'})
            return

        try:
            from garminconnect import Garmin
            client = Garmin(email, password)
            client.login()

            today = date.today().strftime('%Y-%m-%d')

            stats  = self._safe(lambda: client.get_stats(today))
            sleep  = self._safe(lambda: client.get_sleep_data(today))
            stress = self._safe(lambda: client.get_stress_data(today))

            sleep_dto = (sleep or {}).get('dailySleepDTO', {})
            sleep_sec = sleep_dto.get('sleepTimeSeconds')
            scores    = sleep_dto.get('sleepScores', {})

            self._write({
                'ok':             True,
                'date':           today,
                'steps':          (stats or {}).get('totalSteps', 0),
                'stepsGoal':      (stats or {}).get('dailyStepGoal', 10000),
                'caloriesBurned': round((stats or {}).get('totalKilocalories', 0)),
                'activeCalories': round((stats or {}).get('activeKilocalories', 0)),
                'restingHR':      (stats or {}).get('restingHeartRate'),
                'sleep': {
                    'seconds':  sleep_sec,
                    'hours':    round(sleep_sec / 360) / 10 if sleep_sec else None,
                    'score':    (scores.get('overall') or {}).get('value'),
                    'deepSec':  sleep_dto.get('deepSleepSeconds'),
                    'remSec':   sleep_dto.get('remSleepSeconds'),
                    'lightSec': sleep_dto.get('lightSleepSeconds'),
                },
                'stress': {
                    'avg': (stress or {}).get('avgStressLevel'),
                    'max': (stress or {}).get('maxStressLevel'),
                },
            })

        except Exception as e:
            self._write({'ok': False, 'error': str(e)})

    def _safe(self, fn):
        try:
            return fn()
        except Exception:
            return None

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')

    def _write(self, data):
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        pass
