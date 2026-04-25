import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  getDepenses,
  deleteDepense,
  addDepense,
  updateDepense,
  getMonthlyTotal,
} from '../database/database';
import ExpenseFormModal from '../components/ExpenseFormModal';
import { CATEGORIES, getCat } from '../constants/categories';
import { COLORS, formatFCFA, formatDate } from '../constants/theme';

export default function ListScreen() {
  const [depenses, setDepenses] = useState([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loadData = useCallback(async () => {
    const rows = await getDepenses({ search, categorie: filterCat });
    setDepenses(rows);
    const now = new Date();
    const total = await getMonthlyTotal(now.getMonth() + 1, now.getFullYear());
    setMonthTotal(total);
  }, [search, filterCat]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openAdd() {
    setEditItem(null);
    setModalVisible(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setModalVisible(true);
  }

  async function handleSave(data) {
    if (data.id) {
      await updateDepense(data.id, data);
    } else {
      await addDepense(data);
    }
    setModalVisible(false);
    loadData();
  }

  function confirmDelete(item) {
    const cat = getCat(item.categorie);
    Alert.alert(
      'Supprimer la dépense',
      `${cat.emoji} ${item.description || cat.label}\n${formatFCFA(item.montant)}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteDepense(item.id);
            loadData();
          },
        },
      ]
    );
  }

  function renderItem({ item }) {
    const cat = getCat(item.categorie);
    return (
      <TouchableOpacity style={styles.item} onPress={() => openEdit(item)} activeOpacity={0.7}>
        <View style={styles.itemLeft}>
          <View style={[styles.emojiBadge, { backgroundColor: COLORS.primary + '18' }]}>
            <Text style={styles.emoji}>{cat.emoji}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemDesc} numberOfLines={1}>
              {item.description || cat.label}
            </Text>
            <Text style={styles.itemSub}>
              {cat.label} · {formatDate(item.date)}
            </Text>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemAmount}>{formatFCFA(item.montant)}</Text>
          <TouchableOpacity
            onPress={() => confirmDelete(item)}
            style={styles.deleteBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  const now = new Date();
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>🌾 Suivi Dépenses</Text>
          <Text style={styles.headerSub}>{monthLabel}</Text>
        </View>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Total mensuel */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total du mois</Text>
        <Text style={styles.totalAmount}>{formatFCFA(monthTotal)}</Text>
        <Text style={styles.totalCount}>
          {depenses.length} dépense{depenses.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={COLORS.textMedium} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une dépense..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.textLight}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMedium} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres catégorie */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[styles.filterChip, !filterCat && styles.filterChipActive]}
          onPress={() => setFilterCat('')}
        >
          <Text style={[styles.filterText, !filterCat && styles.filterTextActive]}>Toutes</Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, filterCat === cat.id && styles.filterChipActive]}
            onPress={() => setFilterCat(filterCat === cat.id ? '' : cat.id)}
          >
            <Text style={[styles.filterText, filterCat === cat.id && styles.filterTextActive]}>
              {cat.emoji} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste */}
      <FlatList
        data={depenses}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, depenses.length === 0 && styles.listEmpty]}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌾</Text>
            <Text style={styles.emptyText}>Aucune dépense trouvée</Text>
            <Text style={styles.emptyHint}>Appuyez sur + pour en ajouter une</Text>
          </View>
        }
      />

      {/* Modal formulaire */}
      <ExpenseFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        initialData={editItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  addBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 24,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  totalLabel: {
    color: COLORS.white + 'CC',
    fontSize: 13,
    marginBottom: 4,
  },
  totalAmount: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
  },
  totalCount: {
    color: COLORS.white + 'AA',
    fontSize: 12,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: COLORS.textDark,
  },
  filterRow: {
    maxHeight: 48,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.textDark,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  listEmpty: {
    flexGrow: 1,
  },
  item: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emoji: { fontSize: 20 },
  itemInfo: { flex: 1 },
  itemDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  itemSub: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  deleteBtn: { padding: 2 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 6,
  },
});
