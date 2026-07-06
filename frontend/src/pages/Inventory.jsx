import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, bulkCreateInventory } from '../services/inventory.service';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    modelo: '',
    serie: '',
    categoria: '',
    cantidad: 1,
    precio: '',
    estado: 'Bueno',
    ubicacion: '',
    observaciones: '',
    usuario_asignado: ''
  });
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // ============================================
  // CARGAR DATOS DESDE LA BD (OPTIMIZADO)
  // ============================================
  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);
      const data = await getInventory();
      setItems(data);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      setUploadError('Error al cargar los datos desde la base de datos');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================
  // MANEJO DE CARGA DE EXCEL
  // ============================================
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setUploadError('');
    setUploadSuccess('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let allItems = [];
        let totalItems = 0;

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

          if (jsonData.length === 0) return;

          const firstRow = jsonData[0] || {};
          const columns = Object.keys(firstRow);
          const columnsLower = columns.map(c => c.toLowerCase().trim());

          // HOJA 1: Equipos de Cómputo
          if (columnsLower.some(c => c.includes('marca') && c.includes('modelo')) || 
              (columnsLower.some(c => c.includes('serie')) && columnsLower.some(c => c.includes('ram')))) {
            
            const items = jsonData.map((row, index) => {
              const getColumn = (names) => {
                for (const name of names) {
                  const key = columns.find(c => c.toLowerCase().trim() === name.toLowerCase().trim());
                  if (key) return row[key] || '';
                }
                return '';
              };

              const marcaModelo = getColumn(['MARCA Y MODELO', 'MARCA Y MODELO', 'MARCA_MODELO', 'EQUIPO']);
              const serie = getColumn(['NUM DE SERIE', 'NUMERO DE SERIE', 'SERIE', 'NO. SERIE']);
              const usuario = getColumn(['USUARIO', 'USUARIOS', 'RESGUARDA']);
              
              let marca = '';
              let modelo = '';
              if (marcaModelo) {
                const marcasConocidas = ['HP', 'LENOVO', 'DELL', 'SAMSUNG', 'XIAOMI', 'HONOR', 'LG', 'BROTHER', 'GRANDSTREAM', 'RCA'];
                for (const m of marcasConocidas) {
                  if (marcaModelo.toUpperCase().includes(m)) {
                    marca = m;
                    modelo = marcaModelo.replace(m, '').trim();
                    break;
                  }
                }
                if (!marca) {
                  const partes = marcaModelo.split(' ');
                  marca = partes[0] || '';
                  modelo = partes.slice(1).join(' ') || '';
                }
              }

              return {
                nombre: marcaModelo || 'Sin nombre',
                marca: marca || getColumn(['MARCA']),
                modelo: modelo || getColumn(['MODELO']),
                serie: serie || getColumn(['SERIE', 'IMEI']),
                categoria: 'Computadora',
                cantidad: 1,
                precio: 0,
                estado: 'Bueno',
                ubicacion: '',
                observaciones: `RAM: ${getColumn(['RAM'])} | ROM: ${getColumn(['ROM'])} | Procesador: ${getColumn(['PROCESADOR'])} | Gráfica: ${getColumn(['GRAFICA'])}`,
                usuario_asignado: usuario || getColumn(['USUARIO ASIGNADO'])
              };
            });
            
            allItems = [...allItems, ...items];
            totalItems += items.length;
          }

          // HOJA 2: Teléfonos Móviles
          else if (columnsLower.some(c => c.includes('imei')) || 
                   (columnsLower.some(c => c.includes('marca')) && columnsLower.some(c => c.includes('modelo')) && columnsLower.some(c => c.includes('numero')))) {
            
            const items = jsonData.map((row, index) => {
              const getColumn = (names) => {
                for (const name of names) {
                  const key = columns.find(c => c.toLowerCase().trim() === name.toLowerCase().trim());
                  if (key) return row[key] || '';
                }
                return '';
              };

              return {
                nombre: `${getColumn(['MARCA'])} ${getColumn(['MODELO'])}`.trim() || 'Teléfono sin modelo',
                marca: getColumn(['MARCA']),
                modelo: getColumn(['MODELO']),
                serie: getColumn(['SERIE']) || getColumn(['IMEI']),
                categoria: 'Teléfono Móvil',
                cantidad: 1,
                precio: 0,
                estado: 'Bueno',
                ubicacion: '',
                observaciones: `IMEI: ${getColumn(['IMEI'])} | Número: ${getColumn(['NUMERO'])}`,
                usuario_asignado: getColumn(['USUARIO'])
              };
            });
            
            allItems = [...allItems, ...items];
            totalItems += items.length;
          }

          // HOJA 3: Teléfonos IP
          else if (columnsLower.some(c => c.includes('marca')) && 
                   columnsLower.some(c => c.includes('modelo')) && 
                   columnsLower.some(c => c.includes('serie')) &&
                   columns.length <= 5) {
            
            const items = jsonData.map((row, index) => {
              const getColumn = (names) => {
                for (const name of names) {
                  const key = columns.find(c => c.toLowerCase().trim() === name.toLowerCase().trim());
                  if (key) return row[key] || '';
                }
                return '';
              };

              return {
                nombre: `${getColumn(['MARCA'])} ${getColumn(['MODELO'])}`.trim() || 'Teléfono IP',
                marca: getColumn(['MARCA']),
                modelo: getColumn(['MODELO']),
                serie: getColumn(['SERIE']),
                categoria: 'Teléfono IP',
                cantidad: 1,
                precio: 0,
                estado: 'Bueno',
                ubicacion: '',
                observaciones: `Teléfono IP - Modelo: ${getColumn(['MODELO'])}`,
                usuario_asignado: getColumn(['USUARIOS'])
              };
            });
            
            allItems = [...allItems, ...items];
            totalItems += items.length;
          }

          // HOJA 4: Monitores, Impresoras, Plotter
          else if (columnsLower.some(c => c.includes('tipo')) || 
                   (columnsLower.some(c => c.includes('marca')) && columnsLower.some(c => c.includes('modelo')) && 
                    columnsLower.some(c => c.includes('serie')))) {
            
            const items = jsonData.map((row, index) => {
              const getColumn = (names) => {
                for (const name of names) {
                  const key = columns.find(c => c.toLowerCase().trim() === name.toLowerCase().trim());
                  if (key) return row[key] || '';
                }
                return '';
              };

              const tipo = getColumn(['TIPO']);
              const marca = getColumn(['MARCA']);
              const modelo = getColumn(['MODELO']);
              const serie = getColumn(['SERIE']);
              const usuario = getColumn(['Columna1']) || getColumn(['USUARIO']) || getColumn(['RESGUARDA']);
              const estado = getColumn(['ESTADO']) || 'Bueno';
              const observaciones = getColumn(['OBSERVACIONES']);

              let nombre = '';
              if (tipo && marca && modelo) {
                nombre = `${tipo} ${marca} ${modelo}`.trim();
              } else if (marca && modelo) {
                nombre = `${marca} ${modelo}`.trim();
              } else if (tipo) {
                nombre = tipo;
              } else {
                nombre = 'Equipo sin nombre';
              }

              return {
                nombre: nombre,
                marca: marca || '',
                modelo: modelo || '',
                serie: serie || '',
                categoria: tipo || 'Equipo',
                cantidad: 1,
                precio: 0,
                estado: estado,
                ubicacion: '',
                observaciones: observaciones || `Tipo: ${tipo}`,
                usuario_asignado: usuario || ''
              };
            });
            
            allItems = [...allItems, ...items];
            totalItems += items.length;
          }

          // HOJA GENÉRICA
          else {
            const items = jsonData.map((row, index) => {
              const getColumn = (names) => {
                for (const name of names) {
                  const key = columns.find(c => c.toLowerCase().trim() === name.toLowerCase().trim());
                  if (key) return row[key] || '';
                }
                return '';
              };

              const nombre = getColumn(['NOMBRE', 'EQUIPO', 'PRODUCTO', 'DESCRIPCION']);
              const marca = getColumn(['MARCA']);
              const modelo = getColumn(['MODELO']);
              const serie = getColumn(['SERIE', 'NUMERO DE SERIE', 'NO. SERIE']);
              const usuario = getColumn(['USUARIO', 'USUARIOS', 'RESGUARDA', 'ASIGNADO A']);

              return {
                nombre: nombre || `${marca} ${modelo}`.trim() || 'Equipo sin nombre',
                marca: marca || '',
                modelo: modelo || '',
                serie: serie || '',
                categoria: getColumn(['CATEGORIA', 'TIPO']) || 'General',
                cantidad: parseInt(getColumn(['CANTIDAD'])) || 1,
                precio: parseFloat(getColumn(['PRECIO'])) || 0,
                estado: getColumn(['ESTADO']) || 'Bueno',
                ubicacion: getColumn(['UBICACION']) || '',
                observaciones: getColumn(['OBSERVACIONES', 'NOTAS']) || '',
                usuario_asignado: usuario
              };
            });
            
            allItems = [...allItems, ...items];
            totalItems += items.length;
          }
        });

        if (allItems.length > 0) {
          const result = await bulkCreateInventory(allItems);
          setUploadSuccess(`✅ Se cargaron ${result.total} equipos correctamente.`);
          loadData();
        } else {
          setUploadError('No se encontraron datos válidos en ninguna hoja.');
        }

        setLoading(false);
        event.target.value = '';
        
      } catch (error) {
        console.error('Error al leer el archivo:', error);
        setUploadError('Error al procesar el archivo. Verifica el formato.');
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ============================================
  // MANEJO DE CRUD
  // ============================================
  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true);
      setSelectedItem(item);
      setFormData({
        nombre: item.nombre || '',
        marca: item.marca || '',
        modelo: item.modelo || '',
        serie: item.serie || '',
        categoria: item.categoria || '',
        cantidad: item.cantidad || 1,
        precio: item.precio || '',
        estado: item.estado || 'Bueno',
        ubicacion: item.ubicacion || '',
        observaciones: item.observaciones || '',
        usuario_asignado: item.usuario_asignado || ''
      });
    } else {
      setEditMode(false);
      setSelectedItem(null);
      setFormData({
        nombre: '',
        marca: '',
        modelo: '',
        serie: '',
        categoria: '',
        cantidad: 1,
        precio: '',
        estado: 'Bueno',
        ubicacion: '',
        observaciones: '',
        usuario_asignado: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  // OPTIMIZACIÓN: useCallback para evitar recrear la función en cada render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSave = async () => {
    try {
      if (editMode && selectedItem) {
        await updateInventoryItem(selectedItem.id, formData);
      } else {
        await createInventoryItem(formData);
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error al guardar:', error);
      setUploadError('Error al guardar el equipo');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await deleteInventoryItem(id);
        loadData();
      } catch (error) {
        console.error('Error al eliminar:', error);
        setUploadError('Error al eliminar el equipo');
      }
    }
  };

  const handleViewDetail = (item) => {
    setSelectedItem(item);
    setOpenDetailDialog(true);
  };

  // ============================================
  // MANEJO DEL PDF - VALE DE RESGUARDO PROFESIONAL
  // ============================================
  // ============================================
// MANEJO DEL PDF - VALE DE RESGUARDO (CON LOGO DESDE PUBLIC)
// ============================================
const handleViewPdf = (item) => {
  try {
    const doc = new jsPDF('p', 'mm', 'letter');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // COLORES CORPORATIVOS
    const colorPrincipal = [82, 98, 223]; // #5262DF
    const colorPrincipalOscuro = [62, 78, 203];
    const colorFondoClaro = [248, 246, 255];
    
    // ==========================================
    // BARRA SUPERIOR CON LOGO DESDE PUBLIC
    // ==========================================
    doc.setFillColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.rect(0, 0, pageWidth, 20, 'F');
    
    // Cargar logo desde la carpeta public
    try {
        const imgUrl = window.location.origin + '/Spartan24.png';
        doc.addImage(imgUrl, 'PNG', 10, 2, 30, 16);
    } catch (e) {
        // Si falla, mostrar texto como respaldo
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('SPARTAN', 15, 10);
        doc.setFontSize(6);
        doc.setTextColor(220, 220, 255);
        doc.setFont('helvetica', 'normal');
        doc.text('Conveyors & Motion Control', 15, 16);
    }
    
    // ==========================================
    // ENCABEZADO PRINCIPAL
    // ==========================================
    doc.setFillColor(colorPrincipalOscuro[0], colorPrincipalOscuro[1], colorPrincipalOscuro[2]);
    doc.rect(0, 20, pageWidth, 3, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('VALE DE RESGUARDO', pageWidth / 2, 40, { align: 'center' });
    
    doc.setDrawColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.setLineWidth(0.5);
    doc.line(margin + 30, 45, pageWidth - margin - 30, 45);
    
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'italic');
    doc.text('Documento oficial de asignación de equipo', pageWidth / 2, 51, { align: 'center' });
    
    // ==========================================
    // RECUADRO DE INFORMACIÓN
    // ==========================================
    const infoY = 60;
    const infoHeight = 36;
    
    doc.setFillColor(colorFondoClaro[0], colorFondoClaro[1], colorFondoClaro[2]);
    doc.roundedRect(margin, infoY, contentWidth, infoHeight, 2, 2, 'F');
    doc.setDrawColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, infoY, contentWidth, infoHeight, 2, 2, 'D');
    
    const fecha = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const nombreResguarda = item.usuario_asignado || '_________________';
    const col1 = margin + 10;
    const col3 = margin + 120;
    const row1 = infoY + 8;
    const row2 = infoY + 18;
    const row3 = infoY + 28;
    
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    
    doc.setFont('helvetica', 'bold');
    doc.text('FOLIO:', col1, row1);
    doc.setFont('helvetica', 'normal');
    doc.text(`R-${Date.now().toString().slice(-6)}`, col1 + 18, row1);
    
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA:', col3, row1);
    doc.setFont('helvetica', 'normal');
    doc.text(fecha, col3 + 18, row1);
    
    doc.setFont('helvetica', 'bold');
    doc.text('RESGUARDADO POR:', col1, row2);
    doc.setFont('helvetica', 'normal');
    const nombreDisplay = nombreResguarda.length > 25 ? nombreResguarda.substring(0, 25) + '...' : nombreResguarda;
    doc.text(nombreDisplay, col1 + 42, row2);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DEPARTAMENTO:', col1, row3);
    doc.setFont('helvetica', 'normal');
    doc.text('_________________', col1 + 35, row3);
    
    doc.setFont('helvetica', 'bold');
    doc.text('PUESTO:', col3, row3);
    doc.setFont('helvetica', 'normal');
    doc.text('_________________', col3 + 22, row3);
    
    // ==========================================
    // TABLA DE DATOS DEL EQUIPO
    // ==========================================
    const tableY = infoY + infoHeight + 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.text('DATOS DEL EQUIPO', margin, tableY);
    
    doc.setDrawColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.setLineWidth(0.5);
    doc.line(margin + 2, tableY + 4, margin + 56, tableY + 4);
    
    const tableData = [
      ['CÓDIGO', String(item.id || 'N/A')],
      ['EQUIPO', String(item.nombre || 'Sin nombre')],
      ['MARCA', String(item.marca || 'No especificada')],
      ['MODELO', String(item.modelo || 'No especificado')],
      ['SERIE', String(item.serie || 'No especificada')],
      ['ESTADO', String(item.estado || 'Bueno')],
      ['OBSERVACIONES', String(item.observaciones || 'Sin observaciones')]
    ];
    
    doc.autoTable({
      startY: tableY + 6,
      head: [['CAMPO', 'VALOR']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: colorPrincipal,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 3
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        halign: 'center'
      },
      columnStyles: {
        0: { 
          cellWidth: 32, 
          fontStyle: 'bold', 
          textColor: [60, 60, 60], 
          halign: 'center',
          valign: 'middle'
        },
        1: { 
          cellWidth: 'auto', 
          textColor: [40, 40, 40],
          halign: 'center',
          valign: 'middle'
        }
      },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      rowPageBreak: 'avoid',
      didDrawCell: function(data) {
        if (data.section === 'body' && data.row.index === 6) {
          data.cell.styles.fontSize = 7.5;
        }
      }
    });
    
    const tableEndY = doc.lastAutoTable.finalY + 6;
    
    // ==========================================
    // LEYENDA ADMINISTRATIVA
    // ==========================================
    const leyendaY = tableEndY + 4;
    
    const leyendaLines = [
      'Hago constar que los artículos listados anteriormente lo(s) recibo y me obligo en términos del',
      'artículo 134 fracción VI y 135 fracciones III y IX de la Ley Federal del Trabajo a:',
      '',
      '• Conservarlos en buen estado.',
      '• En caso de pérdida o extravío, tendré la responsabilidad de reponer el equipo o',
      '  herramienta en su totalidad de forma inmediata.',
      '• En caso de robo, tendré la responsabilidad de reponer el equipo o herramienta en su',
      '  totalidad de forma inmediata en caso de no levantar la denuncia correspondiente.',
      '• Utilizarlos para lo que están destinados dentro de mis condiciones de trabajo.',
      '• Entregarlos al área correspondiente cuando sea fecha para canjearlos.',
      '• Entregar al jefe inmediato al momento de mi salida de la empresa.'
    ];
    
    const lineHeight = 4.2;
    const leyendaHeight = leyendaLines.length * lineHeight + 12;
    
    doc.setFillColor(colorFondoClaro[0], colorFondoClaro[1], colorFondoClaro[2]);
    doc.roundedRect(margin, leyendaY, contentWidth, leyendaHeight, 2, 2, 'F');
    doc.setDrawColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, leyendaY, contentWidth, leyendaHeight, 2, 2, 'D');
    
    doc.setFontSize(7.5);
    doc.setTextColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('RESPONSABILIDADES DEL RESGUARDANTE', margin + 10, leyendaY + 6);
    
    doc.setDrawColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.setLineWidth(0.3);
    doc.line(margin + 10, leyendaY + 8, margin + contentWidth - 10, leyendaY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(60, 60, 60);
    
    let textY = leyendaY + 13;
    leyendaLines.forEach((line, index) => {
      if (line.startsWith('•')) {
        doc.setFont('helvetica', 'bold');
        doc.text(line, margin + 10, textY);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('  ')) {
        doc.text(line, margin + 14, textY);
      } else {
        doc.text(line, margin + 10, textY);
      }
      textY += lineHeight;
    });
    
    // ==========================================
    // FIRMAS
    // ==========================================
    const firmaY = leyendaY + leyendaHeight + 8;
    const firmaWidth = 70;
    const firma1X = margin + 15;
    const firma2X = pageWidth - margin - 15 - firmaWidth;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin + 10, firmaY, pageWidth - margin - 10, firmaY);
    
    const firmaLineY = firmaY + 10;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    // FIRMA 1 - RESGUARDÓ
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.5);
    doc.line(firma1X, firmaLineY, firma1X + firmaWidth, firmaLineY);
    
    doc.setFont('helvetica', 'bold');
    doc.text('RESGUARDÓ', firma1X + (firmaWidth / 2), firmaLineY + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const nombreFirma = nombreResguarda.length > 20 ? nombreResguarda.substring(0, 20) + '...' : nombreResguarda;
    doc.text(nombreFirma, firma1X + (firmaWidth / 2), firmaLineY + 15, { align: 'center' });
    
    // FIRMA 2 - AUTORIZÓ
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.5);
    doc.line(firma2X, firmaLineY, firma2X + firmaWidth, firmaLineY);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('AUTORIZÓ', firma2X + (firmaWidth / 2), firmaLineY + 8, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.text('ING. NESTOR OLGUIN', firma2X + (firmaWidth / 2), firmaLineY + 15, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(130, 130, 130);
    doc.text('Administrador del Sistema', firma2X + (firmaWidth / 2), firmaLineY + 22, { align: 'center' });
    
    // ==========================================
    // PIE DE PÁGINA
    // ==========================================
    const footerY = pageHeight - 6;
    
    doc.setDrawColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 1, pageWidth - margin, footerY - 1);
    
    doc.setFontSize(6);
    doc.setTextColor(colorPrincipal[0], colorPrincipal[1], colorPrincipal[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Spartan Conveyors', pageWidth / 2, footerY + 3, { align: 'center' });
    
    doc.setFontSize(5.5);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión de Inventario', pageWidth / 2, footerY + 7, { align: 'center' });
    
    // ==========================================
    // GENERAR PDF
    // ==========================================
    const pdfData = doc.output('datauristring');
    setSelectedItem(item);
    setPdfUrl(pdfData);
    setOpenPdfDialog(true);
    
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    setUploadError('Error al generar el vale de resguardo');
  }
};
  const handleDownloadPdf = () => {
    try {
      if (!pdfUrl) return;
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Vale_Resguardo_${selectedItem?.id || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      setUploadError('Error al descargar el PDF');
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'Excelente': 'success',
      'Bueno': 'info',
      'Regular': 'warning',
      'Malo': 'error'
    };
    return colors[estado] || 'default';
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#7B2FBE' }} />
        <Typography sx={{ ml: 2 }}>Cargando inventario...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Inventario de Equipos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestiona todos los equipos y genera vales de resguardo
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            {items.length > 0 ? `${items.length} equipos en inventario` : 'Sin equipos cargados'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Cargar Excel'}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #7B2FBE 0%, #5A1E8A 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6A26A8 0%, #4A1878 100%)',
              }
            }}
          >
            Agregar Equipo
          </Button>
        </Box>
      </Box>

      {/* Alertas */}
      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError('')}>
          {uploadError}
        </Alert>
      )}
      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setUploadSuccess('')}>
          {uploadSuccess}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Total Equipos</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#7B2FBE' }}>{items.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Categorías</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {new Set(items.map(i => i.categoria)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Equipos Excelentes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                {items.filter(i => i.estado === 'Excelente').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Equipos en Mal Estado</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                {items.filter(i => i.estado === 'Malo' || i.estado === 'Regular').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de inventario */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Equipo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Marca</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Modelo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Serie</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Categoría</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Usuario Asignado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay equipos en el inventario. Carga un archivo Excel o agrega uno manualmente.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.marca || '-'}</TableCell>
                  <TableCell>{item.modelo || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={item.serie || 'N/A'} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={item.categoria} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{item.usuario_asignado || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={item.estado} 
                      color={getEstadoColor(item.estado)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetail(item)}
                          sx={{ color: '#7B2FBE' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Previsualizar Vale de Resguardo">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewPdf(item)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <PdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(item)}
                          sx={{ color: '#ed6c02' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(item.id)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para agregar/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8f4ff', color: '#7B2FBE' }}>
          {editMode ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Equipo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Número de Serie"
                name="serie"
                value={formData.serie}
                onChange={handleChange}
                placeholder="Ingresa el número de serie"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Categoría"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                placeholder="Ej: Computadoras, Monitores, Impresoras"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cantidad"
                name="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Precio"
                name="precio"
                type="number"
                value={formData.precio}
                onChange={handleChange}
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <MenuItem value="Excelente">Excelente</MenuItem>
                <MenuItem value="Bueno">Bueno</MenuItem>
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Malo">Malo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Usuario Asignado"
                name="usuario_asignado"
                value={formData.usuario_asignado}
                onChange={handleChange}
                placeholder="Nombre del usuario que resguarda el equipo"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ubicación"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Oficina Central, Bodega, Sucursal Norte"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Notas adicionales sobre el equipo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #7B2FBE 0%, #5A1E8A 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6A26A8 0%, #4A1878 100%)',
              }
            }}
          >
            {editMode ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para ver detalles */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8f4ff', color: '#7B2FBE' }}>
          Detalles del Equipo
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">ID</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedItem.id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Equipo</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedItem.nombre}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Marca</Typography>
                <Typography variant="body1">{selectedItem.marca || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Modelo</Typography>
                <Typography variant="body1">{selectedItem.modelo || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Serie</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedItem.serie || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Categoría</Typography>
                <Typography variant="body1">{selectedItem.categoria}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Usuario Asignado</Typography>
                <Typography variant="body1">{selectedItem.usuario_asignado || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Estado</Typography>
                <Chip label={selectedItem.estado} color={getEstadoColor(selectedItem.estado)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Ubicación</Typography>
                <Typography variant="body1">{selectedItem.ubicacion || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Cantidad</Typography>
                <Typography variant="body1">{selectedItem.cantidad}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Precio</Typography>
                <Typography variant="body1">${parseFloat(selectedItem.precio || 0).toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Observaciones</Typography>
                <Typography variant="body1">{selectedItem.observaciones || 'Sin observaciones'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Fecha de Registro</Typography>
                <Typography variant="body1">{selectedItem.fecha_registro || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PdfIcon />}
                  onClick={() => handleViewPdf(selectedItem)}
                  sx={{
                    background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #c62828 0%, #a71a1a 100%)',
                    }
                  }}
                >
                  Previsualizar Vale de Resguardo
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para previsualizar PDF */}
      <Dialog 
        open={openPdfDialog} 
        onClose={() => {
          setOpenPdfDialog(false);
          setPdfUrl('');
        }} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f8f4ff', color: '#7B2FBE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📄 Previsualización - Vale de Resguardo</span>
          <Box>
            <Button 
              variant="contained" 
              size="small"
              onClick={handleDownloadPdf}
              sx={{ mr: 1, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              Descargar PDF
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => {
                setOpenPdfDialog(false);
                setPdfUrl('');
              }}
            >
              Cerrar
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ height: '80vh', p: 0, bgcolor: '#f5f5f5' }}>
          {pdfUrl && (
            <object
              data={pdfUrl}
              type="application/pdf"
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body1" color="textSecondary">
                  No se pudo mostrar la previsualización del PDF.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleDownloadPdf}
                  sx={{ mt: 2 }}
                >
                  Descargar PDF
                </Button>
              </Box>
            </object>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Inventory;