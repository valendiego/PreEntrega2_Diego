class CustomError {
    static createError({
        name = 'Error',
        cause,
        message,
        code = 1,
        otherProblems = 'No listados',
        status

    }) {
        const error = new Error(message);
        error.name = name;
        error.cause = cause;
        error.code = code;
        error.otherProblems = otherProblems;
        error.status = status
        return error;
    }

}

module.exports = { CustomError };