import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MENSAJES } from '../../../core/constants/mensajes.constants';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading: boolean = false;
  showPassword = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      recordar: [false],
    });
  }
  initForm(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      recordar: [false],
    });
  }
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { correo, contrasena } = this.loginForm.value;

    this.authService.login({ correo, contrasena }).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.notificacionService.success(MENSAJES.SUCCESS.LOGIN);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.notificacionService.error(error.message || MENSAJES.ERROR.LOGIN);
      },
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(
      control &&
      control.hasError(errorName) &&
      (control.dirty || control.touched)
    );
  }
}
