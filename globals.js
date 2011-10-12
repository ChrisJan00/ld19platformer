var runningLocallyOnFirefox = (location.href.substr(0,7) == "file://");

function myGetImageData(ctx, sx, sy, sw, sh) {
    try {
		return ctx.getImageData(sx, sy, sw, sh);
    } catch (e) {
	    if (runningLocallyOnFirefox)
		try {
			    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			    return ctx.getImageData(sx, sy, sw, sh);
	    	} catch (e) {
		    	throw new Error("Cannot access image data: " + e);
			}
    }
}