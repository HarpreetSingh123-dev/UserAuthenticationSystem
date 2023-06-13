const express = require('express')
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateUserProfile, getAllUsers, getParticularUserDetails, updateUserRole, deleteUser } = require('../Controllers/userController')
const { isAuthenticatedUser, authorizedRoles } = require('../Middleware/auth')
const router = express.Router()


router.route("/register").post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logout)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/me').get(  isAuthenticatedUser , getUserDetails)
router.route('/password/update').put(isAuthenticatedUser,updatePassword)
router.route('/me/update').put(isAuthenticatedUser , updateUserProfile)

router.route('/admin/users').get( isAuthenticatedUser , authorizedRoles("admin") , getAllUsers )
router.route('/admin/user/:id').get( isAuthenticatedUser , authorizedRoles("admin") , getParticularUserDetails)
                               .put(isAuthenticatedUser , authorizedRoles("admin" ) , updateUserRole)
                               .delete(isAuthenticatedUser , authorizedRoles("admin" ) , deleteUser)



module.exports = router