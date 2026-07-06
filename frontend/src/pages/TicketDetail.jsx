import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Button,
    TextField,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack,
    Card,
    CardContent,
    Tooltip,
    LinearProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Assignment as AssignmentIcon,
    Warning as WarningIcon,
    Download as DownloadIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { getTicketById, updateTicketStatus, assignTicket } from '../services/ticket.service';
import { getCommentsByTicket, createComment, deleteComment, uploadAttachment } from '../services/comment.service';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [users, setUsers] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const isAdmin = user?.rol === 'admin';

    useEffect(() => {
        loadTicketData();
    }, [id]);

    const loadTicketData = async () => {
        try {
            setLoading(true);
            const [ticketData, commentsData] = await Promise.all([
                getTicketById(id),
                getCommentsByTicket(id)
            ]);
            setTicket(ticketData);
            setComments(commentsData);
            
            // Cargar usuarios si es admin
            if (isAdmin) {
                // Aquí cargarías la lista de usuarios
                // setUsers(await getUsers());
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setError('Error al cargar el ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = async () => {
        if (!commentText.trim()) return;
        
        try {
            setSending(true);
            const newComment = await createComment(id, {
                comentario: commentText,
                usuario_id: user.id
            });
            
            // Si hay archivos adjuntos, subirlos
            if (attachments.length > 0) {
                for (const file of attachments) {
                    await uploadAttachment(id, file);
                }
                setAttachments([]);
            }
            
            setComments([...comments, newComment]);
            setCommentText('');
        } catch (error) {
            console.error('Error al enviar comentario:', error);
            setError('Error al enviar el comentario');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('¿Estás seguro de eliminar este comentario?')) {
            try {
                await deleteComment(commentId);
                setComments(comments.filter(c => c.id !== commentId));
            } catch (error) {
                console.error('Error al eliminar comentario:', error);
                setError('Error al eliminar el comentario');
            }
        }
    };

    const handleStatusChange = async () => {
        try {
            await updateTicketStatus(id, { estado: newStatus });
            setTicket({ ...ticket, estado: newStatus });
            setOpenStatusDialog(false);
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            setError('Error al actualizar el estado');
        }
    };

    const handleAssign = async () => {
        try {
            await assignTicket(id, { asignado_a: selectedUser });
            setTicket({ ...ticket, asignado_a: selectedUser });
            setOpenAssignDialog(false);
        } catch (error) {
            console.error('Error al asignar ticket:', error);
            setError('Error al asignar el ticket');
        }
    };

    const handleFileAttach = (event) => {
        const files = Array.from(event.target.files);
        setAttachments([...attachments, ...files]);
        event.target.value = '';
    };

    const getEstadoColor = (estado) => {
        const colors = {
            abierto: 'error',
            en_proceso: 'warning',
            cerrado: 'success'
        };
        return colors[estado] || 'default';
    };

    const getEstadoIcon = (estado) => {
        const icons = {
            abierto: <PendingIcon />,
            en_proceso: <AssignmentIcon />,
            cerrado: <CheckCircleIcon />
        };
        return icons[estado] || <PendingIcon />;
    };

    const getPrioridadColor = (prioridad) => {
        const colors = {
            baja: 'info',
            media: 'warning',
            alta: 'error',
            critica: 'error'
        };
        return colors[prioridad] || 'default';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#5262DF' }} />
            </Box>
        );
    }

    if (!ticket) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">No se encontró el ticket</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tickets')} sx={{ mt: 2 }}>
                    Volver a mis tickets
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {/* Botón de volver */}
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate('/tickets')}
                sx={{ mb: 2 }}
            >
                Volver a mis tickets
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Información del ticket */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    #{ticket.id} - {ticket.titulo}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                    <Chip 
                                        label={ticket.estado} 
                                        color={getEstadoColor(ticket.estado)} 
                                        size="small"
                                        icon={getEstadoIcon(ticket.estado)}
                                    />
                                    <Chip 
                                        label={`Prioridad: ${ticket.prioridad}`} 
                                        color={getPrioridadColor(ticket.prioridad)} 
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Chip label={ticket.categoria} size="small" variant="outlined" />
                                </Box>
                            </Box>
                            {isAdmin && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={() => setOpenStatusDialog(true)}
                                    >
                                        Cambiar estado
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={() => setOpenAssignDialog(true)}
                                    >
                                        Asignar
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {ticket.descripcion}
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="textSecondary">Creado por</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {ticket.usuario_nombre || 'Usuario'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="textSecondary">Asignado a</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {ticket.asignado_nombre || 'Sin asignar'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="textSecondary">Fecha de creación</Typography>
                                <Typography variant="body2">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="textSecondary">Última actualización</Typography>
                                <Typography variant="body2">
                                    {new Date(ticket.updated_at).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Comentarios */}
                    <Paper sx={{ p: 3, borderRadius: 2, mt: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Comentarios ({comments.length})
                        </Typography>

                        {/* Lista de comentarios */}
                        <Box sx={{ mb: 3, maxHeight: 400, overflow: 'auto' }}>
                            {comments.length === 0 ? (
                                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                                    No hay comentarios aún
                                </Typography>
                            ) : (
                                comments.map((comment) => (
                                    <Card key={comment.id} sx={{ mb: 2, borderRadius: 2 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#5262DF' }}>
                                                        {comment.usuario_nombre?.charAt(0) || 'U'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            {comment.usuario_nombre || 'Usuario'}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                {(isAdmin || comment.usuario_id === user.id) && (
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Box>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {comment.comentario}
                                            </Typography>
                                            {comment.evidencia_url && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Button 
                                                        size="small" 
                                                        startIcon={<DownloadIcon />}
                                                        href={comment.evidencia_url}
                                                        target="_blank"
                                                    >
                                                        Ver evidencia
                                                    </Button>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </Box>

                        {/* Nuevo comentario */}
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Escribe un comentario..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                disabled={sending}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <IconButton 
                                    color="primary"
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={sending}
                                >
                                    <AttachFileIcon />
                                </IconButton>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    multiple
                                    onChange={handleFileAttach}
                                />
                                <IconButton 
                                    color="primary"
                                    onClick={handleSendComment}
                                    disabled={!commentText.trim() || sending}
                                    sx={{ bgcolor: '#5262DF', color: 'white', '&:hover': { bgcolor: '#4555C4' } }}
                                >
                                    {sending ? <CircularProgress size={24} /> : <SendIcon />}
                                </IconButton>
                            </Box>
                        </Box>
                        {attachments.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                    Archivos adjuntos: {attachments.map(f => f.name).join(', ')}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Barra lateral */}
                <Grid item xs={12} md={4}>
                    {/* Resumen */}
                    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Resumen
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary">Estado</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getEstadoIcon(ticket.estado)}
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {ticket.estado.charAt(0).toUpperCase() + ticket.estado.slice(1)}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary">Prioridad</Typography>
                            <Chip 
                                label={ticket.prioridad} 
                                color={getPrioridadColor(ticket.prioridad)} 
                                size="small"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary">Categoría</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {ticket.categoria}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="textSecondary">Última actividad</Typography>
                            <Typography variant="body2">
                                {new Date(ticket.updated_at).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Acciones rápidas */}
                    {!isAdmin && ticket.estado !== 'cerrado' && (
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Acciones
                            </Typography>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                sx={{ mb: 1 }}
                                onClick={() => {
                                    if (ticket.estado === 'abierto') {
                                        setNewStatus('en_proceso');
                                        setOpenStatusDialog(true);
                                    } else {
                                        setNewStatus('cerrado');
                                        setOpenStatusDialog(true);
                                    }
                                }}
                            >
                                {ticket.estado === 'abierto' ? 'Tomar en proceso' : 'Cerrar ticket'}
                            </Button>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            {/* Diálogo para cambiar estado */}
            <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
                <DialogTitle>Cambiar estado del ticket</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={newStatus || ticket?.estado}
                            onChange={(e) => setNewStatus(e.target.value)}
                            label="Estado"
                        >
                            <MenuItem value="abierto">Abierto</MenuItem>
                            <MenuItem value="en_proceso">En proceso</MenuItem>
                            <MenuItem value="cerrado">Cerrado</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStatusDialog(false)}>Cancelar</Button>
                    <Button onClick={handleStatusChange} variant="contained" sx={{ bgcolor: '#5262DF' }}>
                        Actualizar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para asignar */}
            <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)}>
                <DialogTitle>Asignar ticket</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Usuario</InputLabel>
                        <Select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            label="Usuario"
                        >
                            <MenuItem value="">Sin asignar</MenuItem>
                            {/* Aquí irían los usuarios */}
                            <MenuItem value="1">Usuario 1</MenuItem>
                            <MenuItem value="2">Usuario 2</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAssignDialog(false)}>Cancelar</Button>
                    <Button onClick={handleAssign} variant="contained" sx={{ bgcolor: '#5262DF' }}>
                        Asignar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TicketDetail;