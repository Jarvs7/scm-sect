import { Activity } from "lucide-react";
import Status from "../components/Status/Status";
import '../styles/Status/status.css';

export default function StatusPage() {
  return (
    <div className="container mt-4">
      <h1 className="text-center d-flex align-items-center justify-content-center">
        <Activity className="me-2" size={24} strokeWidth={2} />
        Status das Viagens
      </h1>
      <div className="card-body">
        <Status />
      </div>
    </div>
  );
}