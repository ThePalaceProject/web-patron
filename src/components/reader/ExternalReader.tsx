const ExternalReader = ({ setLoading, loading, readUrl }) => {
  return (
    <iframe
      sx={{ flex: 1, visibility: loading ? "hidden" : "visible" }}
      id="external-reader"
      title="External Reader"
      src={readUrl}
      onLoad={() => setLoading(false)}
    />
  );
};

export default ExternalReader;
