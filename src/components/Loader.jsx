import { CircularProgress, Box } from "@mui/material";

const Loader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <CircularProgress size={60} thickness={5} color="primary" />
    </Box>
  );
};

export default Loader;