module.exports = fn => {
    return (req, res, next) => {
        // Ensure that any async function returns a Promise
        fn(req, res, next).catch(err =>  next(err));
    };
};
