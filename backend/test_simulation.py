import unittest
from simulation import SimulationEngine
from optimizer import haversine_distance_km

class TestSimulationLogic(unittest.TestCase):
    def setUp(self):
        self.engine = SimulationEngine()

    def test_initial_state_and_invariants(self):
        state = self.engine.get_state()
        self.assertEqual(state["total_stations"], 6)
        self.assertTrue(state["total_available_batteries"] > 0)
        
        # Check capacity invariant for all stations
        for st in state["stations"]:
            total = st["available"] + st["charging"] + st["reserved"] + st["in_use"]
            self.assertEqual(total, st["capacity"], f"Station {st['name']} capacity mismatch: {total} != {st['capacity']}")
            self.assertTrue(st["available"] >= 0)
            self.assertTrue(st["charging"] >= 0)

    def test_haversine_distance(self):
        # Shinjuku to Shibuya is ~3.5 to 4.5 km
        dist = haversine_distance_km(35.6909, 139.7003, 35.6580, 139.7016)
        self.assertTrue(3.0 <= dist <= 5.0, f"Distance {dist} km out of expected range")

    def test_demand_spike_and_recommendation(self):
        # Trigger spike at Shibuya
        res = self.engine.trigger_demand_spike("shibuya", 20)
        self.assertTrue(res)
        shibuya = self.engine.stations["shibuya"]
        self.assertIn(shibuya["shortage_risk_level"], ["High", "Critical"])
        
        # Recommendations should now exist to help Shibuya
        recs = self.engine.recommendations
        self.assertTrue(len(recs) > 0)
        rec = recs[0]
        self.assertEqual(rec["destination_id"], "shibuya")
        self.assertTrue(rec["transfer_quantity"] >= 4)
        
        # Execute recommendation
        transfer = self.engine.execute_recommendation(rec["id"])
        self.assertIsNotNone(transfer)
        self.assertEqual(len(self.engine.active_transfers), 1)

    def test_simulation_tick(self):
        init_time = self.engine.get_time_string()
        self.engine.tick(seconds_advanced=30)
        new_time = self.engine.get_time_string()
        self.assertNotEqual(init_time, new_time)

if __name__ == "__main__":
    unittest.main()
