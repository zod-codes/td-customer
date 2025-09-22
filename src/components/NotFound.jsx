import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{padding:20}}>
      <h1>Page not found</h1>
      <p>The requested page could not be found.</p>
      <Link to="/">Go home</Link>
    </div>
  );
}

export default NotFound;