export default function RoleSelector({ role, setRole }) {
  return (
    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="bg-gray-800 p-2 rounded"
    >
      <option>Frontend Developer</option>
      <option>Backend Developer</option>
      <option>Full Stack Developer</option>
      <option>DSA</option>
      <option>HR</option>
    </select>
  );
}