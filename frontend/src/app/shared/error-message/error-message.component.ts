import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ErrorMessageComponent {
  public form = input<AbstractControl>();
  public errors = input<{[key: string]: string[] | null}>({});

  public messages = computed(() => {
    const messages: string[] = [];
    const formControl = this.form();

    if (
      formControl &&
      formControl.errors &&
      (formControl.touched || formControl.dirty)
    ) {
      for (const [key, value] of Object.entries(formControl.errors)) {
        if (!value) {
          continue;
        }

        switch (key) {
          case "required":
            messages.push("Field is required");
            break;
          case "minlength":
            messages.push("Field is too short");
            break;
          case "maxlength":
            messages.push("Field is too long");
            break;
          case "email":
            messages.push("Invalid email");
            break;
          default:
            messages.push("Field is invalid");
            break;
        }
      }
    }

    const externalErrors = this.errors() ?? {};
    for (const [key, value] of Object.entries(externalErrors)) {
      if (!value || value.length === 0) {
        continue;
      }

      const prefix =
        key && key !== "non_field_errors"
          ? `${this.toTitleCase(key)}: `
          : "";
      for (const errorMessage of value) {
        messages.push(`${prefix}${errorMessage}`);
      }
    }

    return messages;
  });

  private toTitleCase(value: string): string {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
