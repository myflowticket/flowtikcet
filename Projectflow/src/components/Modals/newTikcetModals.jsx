import { TICKET_TYPES } from "../../constants/ticketTypes";
const [type, setType] = useState("incident");
<div className="form-group">
  <label>Type de ticket</label>
  <select value={type} onChange={(e) => setType(e.target.value)}>
    {TICKET_TYPES.map((t) => (
      <option key={t.id} value={t.id}>
        {t.label}
      </option>
    ))}
  </select>
</div>
const newTicket = {
  title,
  description,
  type, // ← nouveau
  priority,
  assignedTo,
  createdAt: new Date(),
};
