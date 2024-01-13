function ErrorMessage({ error, resetErrorBoundary }) {
  console.error(error);
  return (
    <div className="ErrorMessage">
      <p>An error occurred:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export default ErrorMessage;
