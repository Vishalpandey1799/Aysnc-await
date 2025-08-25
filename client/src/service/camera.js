
export const getCamera = () => {
  
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
       return navigator.mediaDevices.getUserMedia({ video: true });

    } else {
         console.log("getUserMedia is not supported in this browser");
        return Promise.reject(new Error('getUserMedia is not supported in this browser'));
    }

    
}