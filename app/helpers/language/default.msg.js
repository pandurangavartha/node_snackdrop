/*
 * placing the Default messages
 */
module.exports = {
    common : {
        error : {
            noToken : {
                msg: 'No token provided.'
            },
            dataAdd : {
                msg  : 'Some Error while adding !'
            },
            invalidSchema : {
                msg  : 'Selection of Invalid Schema !'
            },
            dataNotFound : {
                msg  : 'No records Available!'
            },
            payloadError : 'Some went wrong, Please try again!',
            pageNotFound : "Oops, Requested page not found."
        }
    },
    user : {
        customer : {
            error : {
                dataNotFound : "No user available",
                invalidCredencials : "Email or Password is incorrect.",
                oldPasswordIncorrect : "Old password is incorrect.",
                pageNotFound : "Oops, Requested page not found."
            },
            success : {
                passwordChanged : "Your password has been changed successfully.",
                profileUpdated : "Your profile has been updated successfully."
            }
        },
        vendor : {
            error : {
                dataNotFound : "No user available",
                invalidCredencials : "Email or password is incorrect.",
                oldPasswordIncorrect : "Old password is incorrect.",
                invalidVerificationLink : "Verification link is invalid."
            },
            success : {
                vendorCreated : "Vendor account has been added successfully.",
                vendorUpdated : "Vendor account details has been updated successfully.",
                vendorDeleted : "Vendor has been deleted successfully.",
                passwordChanged : "Your password has been changed successfully.",
                profileUpdated : "Your profile has been updated successfully.",                
                validVerificationLink : "Verification link is valid.",
                activateAccountSuccess : "Your vendor account has been activated successfully."
            }
        },
        admin : {
            error : {
                dataNotFound : "No user available",
                invalidCredencials : "Email or password is incorrect.",
                oldPasswordIncorrect : "Old password is incorrect."
            },
            success : {
                passwordChanged : "Your password has been changed successfully.",
                profileUpdated : "Your profile has been updated successfully."
            }
        }
    },
    stadium : {
        error : {
            dataNotFound : "No stadium available",
        },
        success : {
            dataAdded : "Stadium has been added.",
            dataUpdated : "Stadium has been updated.",
            dataDeleted : "Stadium has been deleted."
        }
    },
    zone : {
        error : {
            dataNotFound : "No zones available",
        },
        success : {
            dataAdded : "Zone has been added.",
            dataUpdated : "Zone has been updated.",
            dataDeleted : "Zone has been deleted."
        }
    },
    cms : {
        error : {
            dataNotFound : "No cms data available",
        },
        success : {
            dataUpdated : "CMS data has been updated.",
        }
    },
    product : {
        error : {
            dataNotFound : "No product available",
            categoryDataNotFound : "No product category available",
            dealsDataNotFound : "No deals available",
        },
        success : {
            dataAdded : "Product has been added.",
            dataUpdated : "Product has been updated.",
            dataDeleted : "Product has been deleted.",
            statusUpdated : "If you change the product status then all the deals related to that product will be automatically get changed.",
        }
    },
    deals : {
        error : {
            dataNotFound : "No deals available",
            stadiumDataNotFound : "No stadium available",
            dealsDataNotFound : "No deals available",
        },
        success : {
            dataAdded : "deals has been added.",
            dataUpdated : "deals has been updated.",
            dataDeleted : "deals has been deleted."
        }
    },
    order : {
        error : {
            dataNotFound : "No order available",
        },
        success : {
            dataAdded : "Order has been placed successfully.",
            dataDeleted : "Order History has been deleted successfully.",
        }
    },
    faqs : {
        error : {
            dataNotFound : "No FAQs available",
        },
        success : {
            dataAdded : "FAQ has been added.",
            dataUpdated : "FAQ has been updated.",
            dataDeleted : "FAQ has been deleted."
        }
    },
     settings : {
        error : {
            dataNotFound : "No data available",
        },
        success : {
           dataUpdated : "Settings has been updated.",
         }
    },
      vendorconfig : {
        error : {
            dataNotFound : "No vendor available",
        },
        success : {
           
            dataUpdated : "delivery Timings has been updated.",
           
    },
},
    category : {
        error : {
            dataNotFound : "No Product category available",
        },
        success : {
            dataAdded : "Product category has been added.",
            dataUpdated : "Product category has been updated.",
            dataDeleted : "Product category has been deleted."
        }
    },
    guest : {
        error : {
            userExist : "Email id registered with system, Please go through login.",
        },
        success : {
        }
    },
}