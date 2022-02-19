import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-join-dialog',
  templateUrl: './join-dialog.component.html',
  styleUrls: ['./join-dialog.component.scss']
})
export class JoinDialogComponent implements OnInit {

  form: FormGroup;
  description:string;

  constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<JoinDialogComponent>)
  {}

  ngOnInit() {
      this.form = this.fb.group({
          name: ['', [Validators.required]],
      });
  }

  join() {
    if(this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

