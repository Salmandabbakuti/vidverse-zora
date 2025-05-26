/**
 * Standardizes error responses by returning expected errors as normal messages while masking unexpected errors
 * @dev Nextjs server actions hides both expected and unexpected errors from the client. This function helps to standardize error responses.
 * by returning expected errors as normal messages while masking unexpected errors.
 * @param {Error|string} error - The Error object or error message.
 * @param {number} [statusCode=500] - The HTTP status code for the error response.
 * @param {boolean} [isExpected=false] - Indicates if the error is expected.
 * @returns {{statusCode: number, error: string}} Standardized error response object.
 * @example
 * // Expected error
 * errorResponse("User not found", 404, true);
 * // Unexpected error
 * errorResponse(new Error("Database connection failed"));
 */
export const errorResponse = (error, statusCode = 500, isExpected = false) => {
  console.log("error handler:", { error, statusCode, isExpected });
  let message = isExpected ? error?.message || error : "Something went wrong!";
  return { statusCode, error: message };
};
