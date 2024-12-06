import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-dialogActaResponsiva',
  templateUrl: './dialogActaResponsiva.component.html',
  styleUrls: ['./dialogActaResponsiva.component.css']
})

export class DialogActaResponsivaComponent  {
  areaNombre: string;
  form: FormGroup;
  fechaActual: string;
  @ViewChild('contentToConvert') contentToConvert: ElementRef;

  constructor
  ( public dialogRef: MatDialogRef<DialogActaResponsivaComponent>,
    @Inject(MAT_DIALOG_DATA) public responsiva: { form: FormGroup, area: string }
  ) { this.form = responsiva.form;
      this.areaNombre = responsiva.area;
      this.fechaActual = format(new Date(), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es }); // Formatear la fecha
    }

  downloadActa(): void {
    if (!this.contentToConvert) {
      console.error('El elemento contentToConvert no está inicializado.');
        return;
    }

      const element = this.contentToConvert.nativeElement;
      html2canvas(element, {
        scale: 2,
        scrollX: 0,
        scrollY: -window.scrollY,
        useCORS: true
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'letter');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
        const userName = `${this.form.get('nombre').value}_${this.form.get('apellidoPrimero').value}_${this.form.get('apellidoSegundo').value}`;
        pdf.save(`acta_responsiva_${userName}.pdf`);
      });
    }

  printActa(): void {
    if (!this.contentToConvert) {
      console.error('El elemento contentToConvert no está inicializado.');
        return;
    }

    const element = this.contentToConvert.nativeElement;
    html2canvas(element, {
      scale: 2,
      scrollX: 0,
      scrollY: -window.scrollY,
      useCORS: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Acta Responsiva</title>
              <style>
                @page { size: letter; margin: 0; }
                body { margin: 0; }
                img { margin: 30px; width: calc(100% - 60px); height: auto; }
              </style>
            </head>
            <body>
              <img src="${imgData}" onload="window.print();window.close()" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    });
  }

}
