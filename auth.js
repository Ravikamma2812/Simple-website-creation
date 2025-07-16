function isauthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // User is logged in
    }
    req.flash("error_msg", "Please login first"); // ✅ Use req.flash
    return res.redirect("/login"); // ✅ Then redirect
}

function isadmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next(); // User is admin
    }
    req.flash("error_msg", "Access Denied"); // ✅ Flash message
    return res.redirect("/login");
}

module.exports = {
    isauthenticated,
    isadmin
};
