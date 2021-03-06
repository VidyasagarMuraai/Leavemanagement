import {
    Injectable
  } from '@angular/core';
  import {
    Router
  } from '@angular/router';
  import {
    Http,
    RequestOptions,
    Headers
  } from '@angular/http';
  import {
    Observable
  } from 'rxjs';
  
  
  declare var jQuery: any;
  
  @Injectable()
  export class SOAPHandlerService {
    public static GATEWAY_URL: string = "/home/Entity/com.eibus.web.soap.Gateway.wcp?organization=o=Entity,cn=cordys,cn=defaultInst,o=muraai.com";
    public static ERROR = false;
    constructor(private _http: Http) {}
  
  
    public static setGateWayURL(url) {
      SOAPHandlerService.GATEWAY_URL = url;
    }
  
    public static getGateWayURL() {
      return SOAPHandlerService.GATEWAY_URL;
    }
  
    public callCordysSoapService(methodname: string, namespace: string, parameters: any, successHandler, errorHandler, isAsync, extraParams) {
      let response = null;
      jQuery.cordys.json.defaults.removeNamespacePrefix = true;
      var compRef = this;
      if (SOAPHandlerService.getGateWayURL() != null && SOAPHandlerService.getGateWayURL() != "")
        response = this.fireCordysSoapService(methodname, namespace, parameters, successHandler, errorHandler, isAsync, extraParams, compRef);
      return response;
    }
  
  
    public responseResolver(data: any, businessObject: string) {
      return jQuery.map(jQuery.makeArray(data.tuple), function (tuple, index) {
        return tuple.old[businessObject];
      });
    }
  
    public httpget(url: string) {
      return this._http.get(url).pipe((res: any) => res.json());
    }
  
    public httppost(url: string, request, contentType: string) {
      let headers = new Headers({
        'Content-Type': contentType
      });
      let options = new RequestOptions({
        headers: headers
      });
      return this._http.post(url, request, options).pipe((res: any) => res.json());
  
    }
  
    public httpPostRequest(url: string, request, contentType: string) {
      let headers = new Headers({
        'enctype': contentType
      });
      let options = new RequestOptions({
        headers: headers,
      });
      return this._http.post(url, request, options);
  
    }
  
    public httpGetRequest(url: string) {
      return this._http.get(url);
    }
  
    public callOTPSSoapService(methodname: string, namespace: string, parameters: any, extraParams, successHandler = null, failureHandler = null) {
      let response = null;
      alert("Entered");
      jQuery.cordys.json.defaults.removeNamespacePrefix = true;
      var compRef = this;
      if (SOAPHandlerService.getGateWayURL() != null && SOAPHandlerService.getGateWayURL() != "")
        return Observable.create((observer) => {
          let promise = this.fireCordysSoapService(
            methodname,
            namespace,
            parameters,
            successHandler,
            failureHandler,
            true,
            extraParams,
            compRef);
          promise.success((data) => {
            console.log("success");
            if (extraParams != null)
              data['extraParams'] = extraParams;
            observer.next(data)
            console.log("successData"+data);
          });
          promise.error((error) => {
            console.log("failed");
            observer.error(error);
          });
        });
    }
    public fireCordysSoapService(methodname: string, namespace: string, parameters: any, successHandler, failureHandler, isAsync, extraParams, compRef) {
      return jQuery.cordys.ajax({
        method: methodname,
        namespace: namespace,
        url: SOAPHandlerService.getGateWayURL(),
        async: isAsync,
        parameters: parameters,
        success: function (data) {
          if (successHandler) successHandler("Service Failure: " + methodname + " failed. Contact System Administrator", extraParams);
        },
        error: function (response, status, errorText) {
          if (failureHandler) failureHandler(response, status, "Service Failure: " + methodname + " failed. Contact System Administrator", extraParams);
        }
      });
    }
    public UserDetailsFromCordys(id){
      let request = {
        USER_ID: id
      };
      return this.callOTPSSoapService(
        "GetUserDetailsObject",
        "http://schemas.cordys.com/Wsapp",
        request,
        null
        );
      }
      public SaveCordysDeatilsIntoDB(){
        return this.httpPostRequest(SOAPHandlerService.getGateWayURL(),
        '<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">'
        +'<SOAP:Body><UpdateUserDetails xmlns="http://schemas.cordys.com/Wsapp" reply="yes" commandUpdate="no" preserveSpace="no" batchUpdate="no">'
        +'<tuple><new><USER_DETAILS qAccess="0" qConstraint="0" qInit="0" qValues=""><USER_NAME>Praveen</USER_NAME>'
        +'<EMP_ID>3</EMP_ID><GENDER>Male</GENDER><MANAGER>Praveen</MANAGER><NO_OF_LEAVES_REMAIN>12</NO_OF_LEAVES_REMAIN><USER_ID></USER_ID></USER_DETAILS></new></tuple>'
        +'</UpdateUserDetails></SOAP:Body></SOAP:Envelope>',
        'xml');
        }
        public saveLeaveReqIntoDB(data:any){
          return this.httpPostRequest(SOAPHandlerService.getGateWayURL(),
          '<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"><SOAP:Body>'
           +'<UpdateLeaveManagement xmlns="http://schemas.cordys.com/Wsapp" reply="yes" commandUpdate="no" preserveSpace="no" batchUpdate="no">'
           +'<tuple><new><LEAVE_MANAGEMENT qAccess="0" qConstraint="0" qInit="0" qValues=""><START_DATE>'+data.start_date+'</START_DATE>'
            +'<END_DATE>'+data.end_date+'</END_DATE><NO_OF_LEAVES>'+data.no_of_leaves+'</NO_OF_LEAVES><PURPOSE_OF_LEAVE>'+data.reason_leave+'</PURPOSE_OF_LEAVE>'
            +'<STATUS></STATUS><LEAVE_ID></LEAVE_ID><USER_ID>'+data.userID+'</USER_ID></LEAVE_MANAGEMENT>'
            +'</new></tuple></UpdateLeaveManagement></SOAP:Body></SOAP:Envelope>','xml');
          }

          public getUserlogin(data:any){
            let request = {
              userID: data.user_id,
              Password:data.password

            };
            return this.callOTPSSoapService(
              "GetUserLoginBasedIdAndPass",
              "http://schemas.cordys.com/Wsapp",
              request,
              null
              );
            }
          public updateTotalLeaves(data1:any,data2:any,data3:any){
            return this.httpPostRequest(SOAPHandlerService.getGateWayURL(),
            '<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"><SOAP:Body> '
            +'<UpdateUserDetails xmlns="http://schemas.cordys.com/Wsapp" reply="yes" commandUpdate="no" preserveSpace="no" batchUpdate="no"> '
            +'<tuple><old><USER_DETAILS qConstraint="0"><USER_ID>'+data1+'</USER_ID></USER_DETAILS></old><new> '
            +'<USER_DETAILS qAccess="0" qConstraint="0" qInit="0" qValues=""><NO_OF_LEAVES_REMAIN>'+data2+'</NO_OF_LEAVES_REMAIN> '
            +'<NO_OF_LEAVES_APPLIED>'+data3+'</NO_OF_LEAVES_APPLIED><USER_ID>'+data1+'</USER_ID></USER_DETAILS></new></tuple></UpdateUserDetails> '
            +'</SOAP:Body></SOAP:Envelope>','xml');
          }

  }
  