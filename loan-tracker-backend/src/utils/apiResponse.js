/**
 * API Response Utility
 * Standardizes API responses across the application
 */

class ApiResponse {
  /**
   * Success response
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data, // FIXED: Ensure data is always included
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Error response
   */
  static error(res, message = 'Error occurred', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Paginated response
   */
  static paginated(res, data, pagination, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Created response (201)
   */
  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Not found response (404)
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Bad request response (400)
   */
  static badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  /**
   * Unauthorized response (401)
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden response (403)
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Internal server error (500)
   */
  static serverError(res, message = 'Internal server error') {
    return this.error(res, message, 500);
  }
}

module.exports = ApiResponse;