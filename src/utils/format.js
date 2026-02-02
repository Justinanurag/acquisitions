import { error } from "winston";

export const formatValidationError = (error) => {
  // Default response
  const formatted = {
    success: false,
    message: "Validation failed",
    errors: [],
  };

  if (!error) return formatted;

  /* ================= JOI ================= */
  if (error.isJoi && Array.isArray(error.details)) {
    formatted.errors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message.replace(/"/g, ""),
    }));
    return formatted;
  }

  /* ================= ZOD ================= */
  if (error.name === "ZodError" && Array.isArray(error.errors)) {
    formatted.errors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return formatted;
  }

  /* ================= EXPRESS-VALIDATOR ================= */
  if (Array.isArray(error)) {
    formatted.errors = error.map((err) => ({
      field: err.param,
      message: err.msg,
    }));
    return formatted;
  }

  /* ================= CUSTOM ERROR ================= */
  if (typeof error === "object") {
    formatted.errors.push({
      field: error.field || "unknown",
      message: error.message || "Invalid input",
    });
    return formatted;
  }

  /* ================= STRING ERROR ================= */
  if (typeof error === "string") {
    formatted.errors.push({
      field: "unknown",
      message: error,
    });
    return formatted;
  }

  return formatted;
};
