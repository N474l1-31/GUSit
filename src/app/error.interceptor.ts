import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private toastr: ToastrService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          // Network error (e.g., no internet connection)
          this.toastr.error('Network error occurred.', 'Error');
        } else {
          // HTTP Errors (status codes)
          if (error.status === 0) {
            // Handle CORS errors or network failures
            // this.toastr.error('CORS error or network failure. Please try again later.', 'Error');
          } else if (error.status >= 500 && error.status < 600) {
            // Server errors: show toastr, no redirection
            this.toastr.error('Server error occurred. Please try again later.', 'Error');
          } else if (error.status >= 400 && error.status <= 409) {
            // Client-specific errors (e.g., bad request)
            this.toastr.error(`Client error: ${error.status}`, 'Error');
          } else {
            // Handle any other errors
            this.toastr.error('An unexpected error occurred.', 'Error');
          }
        }
        return throwError(error);
      })
    );
  }
}
