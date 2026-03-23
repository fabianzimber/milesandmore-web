import FlightDashboard from "@/components/flight/FlightDashboard";
import { getParticipant, getParticipants } from "@/lib/botApi";
import type { Flight, Participant } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FlightPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const participantData = await getParticipant(hash);

  if (!participantData) {
    return <FlightDashboard hash={hash} initialFlight={null} initialParticipant={null} initialParticipants={[]} />;
  }

  const flight: Flight = {
    id: Number(participantData.flight_id || 0),
    channel_name: String(participantData.channel_name || ""),
    icao_from: String(participantData.icao_from || ""),
    icao_to: String(participantData.icao_to || ""),
    start_time: Number(participantData.start_time || 0),
    end_time: Number(participantData.end_time || 0),
    status: (participantData.flight_status as Flight["status"]) || "boarding",
    pilot: String(participantData.pilot || ""),
    simbrief_ofp_id: participantData.simbrief_ofp_id as string | undefined,
    aircraft_icao: participantData.aircraft_icao as string | undefined,
    aircraft_name: participantData.aircraft_name as string | undefined,
    flight_number: participantData.flight_number as string | undefined,
    route: participantData.route as string | undefined,
    cruise_altitude: participantData.cruise_altitude as number | undefined,
    distance_nm: participantData.distance_nm as number | undefined,
    estimated_time_enroute: participantData.estimated_time_enroute as number | undefined,
    dep_name: participantData.dep_name as string | undefined,
    arr_name: participantData.arr_name as string | undefined,
    dep_gate: participantData.dep_gate as string | undefined,
    arr_gate: participantData.arr_gate as string | undefined,
    aircraft_total_seats: Number(participantData.aircraft_total_seats || 180),
    seat_config: String(participantData.seat_config || "3-3"),
    current_lat: Number(participantData.current_lat || 0),
    current_lon: Number(participantData.current_lon || 0),
    current_alt: Number(participantData.current_alt || 0),
    current_speed: Number(participantData.current_speed || 0),
    current_heading: Number(participantData.current_heading || 0),
    boarding_hash: participantData.boarding_hash as string | undefined,
    dep_country: participantData.dep_country as string | undefined,
    arr_country: participantData.arr_country as string | undefined,
    arr_country_name: participantData.arr_country_name as string | undefined,
  };

  const participant: Participant = {
    id: Number(participantData.id || 0),
    flight_id: Number(participantData.flight_id || 0),
    user_id: String(participantData.user_id || ""),
    user_name: String(participantData.user_name || ""),
    seat: participantData.seat ? String(participantData.seat) : undefined,
    participant_hash: String(participantData.participant_hash || ""),
    joined_at: Number(participantData.joined_at || 0),
    miles_earned: Number(participantData.miles_earned || 0),
    boarding_pass_data: participantData.boarding_pass_data as Participant["boarding_pass_data"],
  };
  const participants = await getParticipants(flight.id);

  return (
    <FlightDashboard
      hash={hash}
      initialFlight={flight}
      initialParticipant={participant}
      initialParticipants={participants}
    />
  );
}
