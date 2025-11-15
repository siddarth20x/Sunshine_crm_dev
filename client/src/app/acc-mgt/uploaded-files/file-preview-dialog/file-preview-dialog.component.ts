import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-preview-dialog',
  templateUrl: './file-preview-dialog.component.html',
  styleUrls: ['./file-preview-dialog.component.css']
})
export class FilePreviewDialogComponent implements OnInit {
  processedCSV: any[] = [];
  headers: string[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { fileUrl: string, fileName: string },
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (!this.data.fileName) {
      this.error = 'No file name provided';
      this.loading = false;
      return;
    }
    this.http.get(`/api/account/preview-db?fileName=${encodeURIComponent(this.data.fileName)}`, { responseType: 'text' }).subscribe({
      next: content => {
        try {
          const lines = content.split('\n').filter(line => line.trim().length > 0);
          if (lines.length < 2) {
            this.error = 'No data found in file';
            this.loading = false;
            return;
          }
          this.headers = lines[0].split(',').map(h => h.trim());
          this.processedCSV = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            this.headers.forEach((header, i) => {
              obj[header] = values[i] || '';
            });
            return obj;
          });
        } catch (err) {
          this.error = 'Error parsing file content';
          console.error('Parse error:', err);
        }
        this.loading = false;
      },
      error: err => {
        console.error('Preview error:', err);
        this.error = 'Unable to load file content from database';
        this.loading = false;
      }
    });
  }
} 