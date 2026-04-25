import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { COLORS, todayISO } from '../constants/theme';

export default function ExpenseFormModal({ visible, onClose, onSave, initialData }) {
  const [date, setDate] = useState(todayISO());
  const [categorie, setCategorie] = useState('achat');
  const [description, setDescription] = useState('');
  const [montant, setMontant] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!visible) return;
    if (initialData) {
      setDate(initialData.date);
      setCategorie(initialData.categorie);
      setDescription(initialData.description);
      setMontant(String(initialData.montant));
    } else {
      setDate(todayISO());
      setCategorie('achat');
      setDescription('');
      setMontant('');
    }
    setErrors({});
  }, [visible, initialData]);

  function validate() {
    const e = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) e.date = 'Format requis : AAAA-MM-JJ';
    const m = parseInt(montant, 10);
    if (!montant || isNaN(m) || m <= 0) e.montant = 'Montant invalide (doit être > 0)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    await onSave({
      id: initialData?.id,
      date,
      categorie,
      description: description.trim(),
      montant: parseInt(montant, 10),
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kvWrapper}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {initialData ? 'Modifier la dépense' : 'Nouvelle dépense'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Date */}
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={[styles.input, errors.date && styles.inputError]}
                value={date}
                onChangeText={setDate}
                placeholder="AAAA-MM-JJ"
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}

              {/* Catégorie */}
              <Text style={styles.label}>Catégorie</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chips}
                keyboardShouldPersistTaps="handled"
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, categorie === cat.id && styles.chipSelected]}
                    onPress={() => setCategorie(cat.id)}
                  >
                    <Text style={[styles.chipText, categorie === cat.id && styles.chipTextSelected]}>
                      {cat.emoji} {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Description */}
              <Text style={styles.label}>
                Description <Text style={styles.optional}>(optionnel)</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Ex : Semences de maïs hybride"
                placeholderTextColor={COLORS.textLight}
              />

              {/* Montant */}
              <Text style={styles.label}>Montant (FCFA)</Text>
              <View style={styles.amountRow}>
                <TextInput
                  style={[styles.input, styles.amountInput, errors.montant && styles.inputError]}
                  value={montant}
                  onChangeText={setMontant}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textLight}
                />
                <Text style={styles.fcfaLabel}>FCFA</Text>
              </View>
              {errors.montant ? <Text style={styles.errorText}>{errors.montant}</Text> : null}

              {/* Boutons */}
              <View style={styles.buttons}>
                <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                  <Text style={styles.btnCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                  <Text style={styles.btnSaveText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  kvWrapper: {
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 18, color: COLORS.textMedium },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 14,
    marginBottom: 6,
  },
  optional: {
    fontWeight: '400',
    color: COLORS.textMedium,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
    flex: 1,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  chips: {
    marginBottom: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textDark,
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    marginRight: 8,
  },
  fcfaLabel: {
    fontSize: 15,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 8,
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginRight: 12,
  },
  btnCancelText: {
    fontSize: 15,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  btnSave: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  btnSaveText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '700',
  },
});
