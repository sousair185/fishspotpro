
import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Trash2, RefreshCw } from 'lucide-react';

export const NotificationManager = () => {
  const { notifications, loading, createNotification, deleteNotification, refreshNotifications } = useNotifications();
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    expiresAt: '',
    priority: 'medium',
    type: 'admin'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message || !formData.expiresAt) {
      return;
    }
    
    setIsSubmitting(true);
    
    await createNotification({
      title: formData.title,
      message: formData.message,
      expiresAt: new Date(formData.expiresAt).toISOString(),
      priority: formData.priority as 'high' | 'medium' | 'low',
      type: 'admin'
    });
    
    setFormData({
      title: '',
      message: '',
      expiresAt: '',
      priority: 'medium',
      type: 'admin'
    });
    
    setIsSubmitting(false);
  };
  
  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };
  
  // Filter out system notifications
  const adminNotifications = notifications.filter(n => n.type === 'admin');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Criar Nova Notificação
          </CardTitle>
          <CardDescription>
            Notificações serão exibidas para todos os usuários até a data de expiração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Título
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Título da notificação"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Mensagem
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Mensagem da notificação"
                required
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium mb-1">
                  Data de Expiração
                </label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-1">
                  Prioridade
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Criando...' : 'Criar Notificação'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notificações Ativas</CardTitle>
            <CardDescription>
              Gerenciar notificações criadas por você
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={refreshNotifications}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Carregando notificações...</p>
            </div>
          ) : adminNotifications.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhuma notificação ativa no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="border rounded-md p-4 flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Expira em: {new Date(notification.expiresAt).toLocaleDateString()} {new Date(notification.expiresAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
