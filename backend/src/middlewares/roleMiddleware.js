    import createHttpError from 'http-errors';

    const isAdmin = (req, res, next) => {
        try{
            if (!req.user) {
            const error = createHttpError(401, "User not authenticated!");
            return next(error);
            }
            
            if( req.user.role !== 'admin'){
            const error = createHttpError(403, "Access denied. Admins only.");
            return next(error);
            }
            
            
            next();

        }
        catch(error){
            next(error);
        }
     
    }

const isVendor = (req, res, next) => {
    try{
        if (!req.user) {
            const error = createHttpError(401, "User not authenticated!");
            return next(error);
        }

        if(req.user.role !== 'vendor'){
            const error = createHttpError(403, "Access denied. Vendors only.");
            return next(error);
        }
        next();
    }
    catch(error){
        next(error);
    }
    
}

const isAdminOrVendor = (req, res, next) => {
    try{
        if (!req.user) {
            const error = createHttpError(401, "User not authenticated!");
            return next(error);
        }   
    }
    catch(error){
        next(error);
    }       
}
export { isAdmin, isVendor, isAdminOrVendor };