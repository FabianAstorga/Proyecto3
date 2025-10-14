import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass && confirm && pass !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    passwordGroup: this.fb.group({
      password:         ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword:  ['', [Validators.required]]
    }, { validators: [passwordsMatch] }),
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  showPassword = false;
  showConfirm  = false;

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, lastName, email, passwordGroup } = this.form.value;
    const payload = {
      firstName,
      lastName,
      email,
      password: passwordGroup?.password
    };
    // TODO: enviar a tu backend
    console.log('Register payload', payload);
  }

  // Getters de comodidad
  get f() { return this.form.controls as any; }
  get pg() { return (this.form.get('passwordGroup') as AbstractControl); }
  get p()  { return this.pg.get('password'); }
  get c()  { return this.pg.get('confirmPassword'); }
}
