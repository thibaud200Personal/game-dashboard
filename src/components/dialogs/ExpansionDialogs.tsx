import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog';

interface ExpansionFormData {
  name: string;
  year_published: string | number;
  bgg_expansion_id: string | number;
  description: string;
}

interface ExpansionFormProps {
  formData: ExpansionFormData;
  setFormData: (data: ExpansionFormData | ((prev: ExpansionFormData) => ExpansionFormData)) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitText: string;
}

const ExpansionForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  submitText 
}: ExpansionFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name" className="text-white">Nom de l'extension *</Label>
      <Input
        id="name"
        name="name"
        value={formData.name}
        onChange={(e) => setFormData((prev: ExpansionFormData) => ({ ...prev, name: e.target.value }))}
        className="bg-slate-700/50 border-slate-600 text-white"
        placeholder="Nom de l'extension"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="year_published" className="text-white">Année de publication</Label>
      <Input
        id="year_published"
        name="year_published"
        type="number"
        value={formData.year_published}
        onChange={(e) => setFormData((prev: ExpansionFormData) => ({ ...prev, year_published: e.target.value }))}
        className="bg-slate-700/50 border-slate-600 text-white"
        placeholder="2024"
        min="1900"
        max={new Date().getFullYear() + 5}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="bgg_expansion_id" className="text-white">ID BGG</Label>
      <Input
        id="bgg_expansion_id"
        name="bgg_expansion_id"
        type="number"
        value={formData.bgg_expansion_id}
        onChange={(e) => setFormData((prev: ExpansionFormData) => ({ ...prev, bgg_expansion_id: e.target.value }))}
        className="bg-slate-700/50 border-slate-600 text-white"
        placeholder="ID BoardGameGeek"
        min="1"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="description" className="text-white">Description</Label>
      <Textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={(e) => setFormData((prev: ExpansionFormData) => ({ ...prev, description: e.target.value }))}
        className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
        placeholder="Description de l'extension..."
      />
    </div>

    <div className="flex justify-end gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
      >
        Annuler
      </Button>
      <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
        {submitText}
      </Button>
    </div>
  </form>
);

interface AddExpansionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ExpansionFormData;
  setFormData: (data: ExpansionFormData | ((prev: ExpansionFormData) => ExpansionFormData)) => void;
  onSubmit: (e: React.FormEvent) => void;
  darkMode: boolean;
}

export function AddExpansionDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  darkMode
}: AddExpansionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={darkMode ? "bg-slate-800 border-slate-700 max-w-md mx-4" : "bg-white border-slate-200 max-w-md mx-4"}>
        <DialogHeader>
          <DialogTitle className={darkMode ? "text-white" : "text-slate-900"}>Ajouter une extension</DialogTitle>
          <DialogDescription className={darkMode ? "text-white/70" : "text-slate-700/70"}>
            Ajoutez une nouvelle extension pour ce jeu.
          </DialogDescription>
        </DialogHeader>
        <ExpansionForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit} 
          onCancel={() => onOpenChange(false)}
          submitText="Ajouter" 
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditExpansionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ExpansionFormData;
  setFormData: (data: ExpansionFormData | ((prev: ExpansionFormData) => ExpansionFormData)) => void;
  onSubmit: (e: React.FormEvent) => void;
  darkMode: boolean;
}

export function EditExpansionDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  darkMode
}: EditExpansionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={darkMode ? "bg-slate-800 border-slate-700 max-w-md mx-4" : "bg-white border-slate-200 max-w-md mx-4"}>
        <DialogHeader>
          <DialogTitle className={darkMode ? "text-white" : "text-slate-900"}>Modifier l'extension</DialogTitle>
          <DialogDescription className={darkMode ? "text-white/70" : "text-slate-700/70"}>
            Modifiez les informations de cette extension.
          </DialogDescription>
        </DialogHeader>
        <ExpansionForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit} 
          onCancel={() => onOpenChange(false)}
          submitText="Modifier" 
        />
      </DialogContent>
    </Dialog>
  );
}

interface DeleteExpansionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  expansionName: string;
  onConfirm: () => void;
  darkMode: boolean;
}

export function DeleteExpansionDialog({
  isOpen,
  onOpenChange,
  expansionName,
  onConfirm,
  darkMode
}: DeleteExpansionDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className={darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}>
        <AlertDialogHeader>
          <AlertDialogTitle className={darkMode ? "text-white" : "text-slate-900"}>Supprimer l'extension</AlertDialogTitle>
          <AlertDialogDescription className={darkMode ? "text-slate-300" : "text-slate-700"}>
            Êtes-vous sûr de vouloir supprimer l'extension "{expansionName}" ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700/50" : "border-slate-300 text-slate-700 hover:bg-slate-100"}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}