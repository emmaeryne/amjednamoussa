import { useState } from 'react';
import { usePromoCodes, useCreatePromoCode, useUpdatePromoCode, useDeletePromoCode, PromoCode } from '@/hooks/usePromoCodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PromoCodesManager = () => {
  const { data: promoCodes, isLoading } = usePromoCodes();
  const createPromoCode = useCreatePromoCode();
  const updatePromoCode = useUpdatePromoCode();
  const deletePromoCode = useDeletePromoCode();
  
  const [isOpen, setIsOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
  });

  const handleCreate = async () => {
    if (!newCode.code || !newCode.discount_value) return;
    
    await createPromoCode.mutateAsync({
      code: newCode.code,
      discount_type: newCode.discount_type,
      discount_value: parseFloat(newCode.discount_value),
      min_order_amount: newCode.min_order_amount ? parseFloat(newCode.min_order_amount) : undefined,
      max_uses: newCode.max_uses ? parseInt(newCode.max_uses) : undefined,
      expires_at: newCode.expires_at || undefined,
    });
    
    setNewCode({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_uses: '',
      expires_at: '',
    });
    setIsOpen(false);
  };

  const handleToggleActive = (promo: PromoCode) => {
    updatePromoCode.mutate({ id: promo.id, is_active: !promo.is_active });
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce code promo?')) {
      deletePromoCode.mutate(id);
    }
  };

  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-xl font-semibold">Codes Promo</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="rose" size="sm">
              <Plus size={16} className="mr-2" />
              Nouveau code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un code promo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Code</Label>
                <Input
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  placeholder="ex: SOLDES20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type de réduction</Label>
                  <Select
                    value={newCode.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => setNewCode({ ...newCode, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                      <SelectItem value="fixed">Montant fixe (DT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valeur</Label>
                  <Input
                    type="number"
                    value={newCode.discount_value}
                    onChange={(e) => setNewCode({ ...newCode, discount_value: e.target.value })}
                    placeholder={newCode.discount_type === 'percentage' ? 'ex: 20' : 'ex: 10'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Commande minimum (DT)</Label>
                  <Input
                    type="number"
                    value={newCode.min_order_amount}
                    onChange={(e) => setNewCode({ ...newCode, min_order_amount: e.target.value })}
                    placeholder="Optionnel"
                  />
                </div>
                <div>
                  <Label>Utilisations max</Label>
                  <Input
                    type="number"
                    value={newCode.max_uses}
                    onChange={(e) => setNewCode({ ...newCode, max_uses: e.target.value })}
                    placeholder="Illimité"
                  />
                </div>
              </div>
              <div>
                <Label>Date d'expiration</Label>
                <Input
                  type="datetime-local"
                  value={newCode.expires_at}
                  onChange={(e) => setNewCode({ ...newCode, expires_at: e.target.value })}
                />
              </div>
              <Button 
                variant="rose" 
                className="w-full"
                onClick={handleCreate}
                disabled={createPromoCode.isPending || !newCode.code || !newCode.discount_value}
              >
                {createPromoCode.isPending ? 'Création...' : 'Créer le code'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : promoCodes && promoCodes.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Min. commande</TableHead>
                <TableHead>Utilisations</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-sm">
                      {promo.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {promo.discount_type === 'percentage' ? (
                        <>
                          <Percent size={14} className="text-secondary" />
                          <span>{promo.discount_value}%</span>
                        </>
                      ) : (
                        <>
                          <span>{promo.discount_value} DT</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {promo.min_order_amount > 0 ? `${promo.min_order_amount} DT` : '-'}
                  </TableCell>
                  <TableCell>
                    {promo.current_uses}{promo.max_uses ? `/${promo.max_uses}` : ''}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {promo.expires_at
                      ? format(new Date(promo.expires_at), 'dd MMM yyyy', { locale: fr })
                      : 'Jamais'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={promo.is_active}
                      onCheckedChange={() => handleToggleActive(promo)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-12 text-center">
          <Tag size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun code promo</p>
        </div>
      )}
    </div>
  );
};

export default PromoCodesManager;
