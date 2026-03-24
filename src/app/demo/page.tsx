import FlightDashboard from "@/components/flight/FlightDashboard";
import type { Flight, Participant } from "@/lib/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miles & More | Passenger Demo",
  description: "Erlebe das Passenger Dashboard anhand von interaktiven Demo-Daten.",
};

const mockFlight: Flight = {
  id: 1042,
  channel_name: "shiftbloom",
  icao_from: "EDDF",
  icao_to: "KJFK",
  start_time: Date.now() - 3600000,
  end_time: 0,
  status: "in_flight",
  pilot: "shiftbloom",
  aircraft_icao: "A388",
  aircraft_name: "Airbus A380-800",
  flight_number: "LH400",
  route: "EDDF/07C TOBAK1L TOBAK UM324",
  cruise_altitude: 36000,
  distance_nm: 3341,
  estimated_time_enroute: 28400,
  dep_name: "Frankfurt Am Main",
  arr_name: "John F Kennedy Intl",
  dep_gate: "Z54",
  arr_gate: "T1",
  aircraft_total_seats: 509,
  seat_config: "3-4-3",
  current_lat: 53.5,
  current_lon: -30.2,
  current_alt: 35980,
  current_speed: 489,
  current_heading: 284,
};

const mockParticipant: Participant = {
  id: 999,
  flight_id: 1042,
  user_id: "demo_user",
  user_name: "DemoPassenger",
  seat: "12A",
  participant_hash: "demo-hash-123456",
  joined_at: Date.now() - 4000000,
  miles_earned: 0,
  boarding_pass_data: {
    passenger_name: "DemoPassenger",
    flight_number: "LH400",
    seat: "12A",
    gate: "Z54",
    departure: "Frankfurt Am Main",
    arrival: "John F Kennedy Intl",
    dep_code: "EDDF",
    arr_code: "KJFK",
    date: new Date().toLocaleDateString("de-DE"),
    boarding_time: "18:30",
    aircraft: "Airbus A380-800",
  },
};

const mockParticipants: Participant[] = [
  mockParticipant,
  {
    id: 1000,
    flight_id: 1042,
    user_id: "user2",
    user_name: "TwitchViewer99",
    seat: "12B",
    participant_hash: "abcd",
    joined_at: Date.now() - 3800000,
    miles_earned: 0,
  },
  {
    id: 1001,
    flight_id: 1042,
    user_id: "user3",
    user_name: "AirlineFan",
    seat: "1A",
    participant_hash: "efgh",
    joined_at: Date.now() - 3900000,
    miles_earned: 0,
  },
  {
    id: 1002,
    flight_id: 1042,
    user_id: "user4",
    user_name: "FrequentFlyer",
    seat: "11C",
    participant_hash: "jklm",
    joined_at: Date.now() - 3950000,
    miles_earned: 0,
  }
];

export default function DemoPage() {
  return (
    <div className="bg-background">
      <FlightDashboard
        hash="demo-hash-123456"
        initialFlight={mockFlight}
        initialParticipant={mockParticipant}
        initialParticipants={mockParticipants}
        isDemo={true}
      />
    </div>
  );
}
