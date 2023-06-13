const express = require('express');
const { getAllProducts , createProduct, updateProduct, deleteProduct, getParticularProductDetails } = require('../Controllers/productController');
const { createProductReview, getProductReviews, deleteReview } = require('../Controllers/userController');
const {isAuthenticatedUser , authorizedRoles} = require('../Middleware/auth');

const router = express.Router();


router.route("/products").get( /*isAuthenticatedUser ,*/ getAllProducts)
router.route("/admin/product/new").post( isAuthenticatedUser , authorizedRoles("admin"), createProduct)
router.route('/admin/product/:id').put(isAuthenticatedUser ,authorizedRoles("admin") , updateProduct)
                            .delete(isAuthenticatedUser ,authorizedRoles("admin") , deleteProduct)
                           

router.route('/product/:id').get(getParticularProductDetails)

router.route('/review').put(isAuthenticatedUser , createProductReview)

router.route('/reviews').get(getProductReviews).delete(isAuthenticatedUser , deleteReview)
module.exports = router


