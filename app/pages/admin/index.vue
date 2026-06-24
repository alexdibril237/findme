<template>
  <div class="admin-dashboard">

    <!-- En-tête -->
    <div class="admin-header">
      <div>
        <h1>{{ $t('admin.dashboard') }}</h1>
        <p class="admin-sub">{{ $t('admin.welcome') }}, {{ authStore.currentUser?.name }} · Administration findMe</p>
      </div>
      <span class="badge badge-warning">{{ $t('admin.badge_admin') }}</span>
    </div>

    <!-- ═══ STATS CARDS ═══ -->
    <div class="stats-grid" v-if="!statsLoading">
      <div class="stat-card card">
        <div class="stat-icon" style="background:#E6F1FB">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-value">{{ stats.totalUsers?.toLocaleString('fr-FR') || '—' }}</div>
        <div class="stat-label">{{ $t('admin.stats.total_users') }}</div>
        <div class="stat-trend">+{{ stats.newMonth?.toLocaleString('fr-FR') || 0 }} {{ $t('admin.new_month') }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background:#E6F4ED">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C6B3A" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="stat-value">{{ stats.totalAddresses?.toLocaleString('fr-FR') || '—' }}</div>
        <div class="stat-label">{{ $t('admin.stats.total_addresses') }}</div>
        <div class="stat-trend">{{ stats.verifiedMonth?.toLocaleString('fr-FR') || 0 }} {{ $t('admin.verified_month') }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background:#FEE2E2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-value">{{ stats.openTickets || 0 }}</div>
        <div class="stat-label">Tickets non traités</div>
        <div class="stat-trend">{{ stats.resolvedMonth || 0 }} traité(s)</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background:#E6F4ED">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C6B3A" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-value">{{ msgStore.adminInbox.length }}</div>
        <div class="stat-label">Total tickets support</div>
        <div class="stat-trend">{{ msgStore.adminInbox.filter(m => m.read).length }} traité(s)</div>
      </div>
    </div>
    <div v-else class="stats-grid">
      <div v-for="i in 4" :key="i" class="skeleton" style="height:110px;border-radius:16px"></div>
    </div>

    <!-- ═══ ONGLETS ═══ -->
    <div class="tabs-bar">
      <button class="tab" :class="{ active: tab === 'users' }" @click="tab = 'users'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
        {{ $t('admin.users') }}
        <span class="tab-count">{{ users.length }}</span>
      </button>
      <button class="tab" :class="{ active: tab === 'addresses' }" @click="tab = 'addresses'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {{ $t('admin.addresses') }}
        <span class="tab-count">{{ addresses.length }}</span>
      </button>
      <button class="tab" :class="{ active: tab === 'messages' }" @click="tab = 'messages'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {{ $t('admin.messages_tab') }}
        <span class="tab-count" :class="{ 'tab-count-alert': msgStore.adminUnreadCount > 0 }">
          {{ msgStore.adminInbox.length }}
        </span>
      </button>
    </div>

    <!-- ═══ ONGLET UTILISATEURS ═══ -->
    <div v-if="tab === 'users'" class="card table-card">
      <div class="filters-bar">
        <div class="filter-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="uSearch" type="search" class="search-input" :placeholder="$t('admin.filters.name_email')"/>
        </div>
        <select v-model="uRole" class="form-select filter-select">
          <option value="">{{ $t('admin.filters.all_roles') }}</option>
          <option value="admin">{{ $t('admin.filters.admin_role') }}</option>
          <option value="user">{{ $t('admin.filters.user_role') }}</option>
        </select>
        <select v-model="uCity" class="form-select filter-select">
          <option value="">{{ $t('admin.filters.all_cities') }}</option>
          <option v-for="c in userCities" :key="c" :value="c">{{ c }}</option>
        </select>
        <button v-if="uSearch || uRole || uCity" class="btn btn-ghost btn-sm reset-btn" @click="uSearch='';uRole='';uCity=''">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          {{ $t('admin.filters.reset') }}
        </button>
        <button class="btn btn-ghost btn-sm" @click="refreshLocalUsers" title="Actualiser">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
        <button class="btn btn-primary btn-sm" @click="openCreateUser" style="margin-left:auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Ajouter
        </button>
        <span class="filter-count">{{ filteredUsers.length }} {{ $t('admin.filters.results') }}</span>
      </div>

      <div v-if="usersLoading" class="table-loading">
        <div v-for="i in 4" :key="i" class="skeleton" style="height:52px;border-radius:8px;margin-bottom:8px"></div>
      </div>
      <div v-else-if="filteredUsers.length === 0" class="empty-state" style="padding:40px">
        <p>{{ $t('admin.empty_users') }}</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t('admin.table.user_col') }}</th>
              <th>{{ $t('admin.table.email') }}</th>
              <th>{{ $t('admin.table.role') }}</th>
              <th>{{ $t('admin.table.city') }}</th>
              <th>{{ $t('admin.table.addresses') }}</th>
              <th>{{ $t('admin.table.joined') }}</th>
              <th>{{ $t('admin.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in paginatedUsers" :key="u.id">
              <td>
                <div class="user-cell">
                  <div class="mini-avatar" :style="{ background: avatarBg(u.name) }">{{ initials(u.name) }}</div>
                  <div>
                    <div class="user-name">{{ u.name || 'Inconnu' }}</div>
                    <div class="user-id">{{ u.id }}</div>
                  </div>
                </div>
              </td>
              <td class="muted">{{ u.email }}</td>
              <td>
                <span class="badge" :class="u.role === 'admin' ? 'badge-warning' : 'badge-primary'">
                  {{ u.role === 'admin' ? $t('admin.filters.admin_role') : $t('admin.filters.user_role') }}
                </span>
              </td>
              <td class="muted">{{ u.city || '—' }}</td>
              <td><span class="count-bubble">{{ u.addressCount ?? 0 }}</span></td>
              <td class="muted">{{ fmtDate(u.createdAt) }}</td>
              <td>
                <div class="row-actions">
                  <button
                    v-if="u.role !== 'admin'"
                    class="btn btn-ghost btn-xs action-btn"
                    @click="openComposeTo(u)"
                    :title="$t('admin.compose_title')"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Message
                  </button>
                  <button
                    v-if="u._local"
                    class="btn btn-ghost btn-xs action-btn edit-btn"
                    @click="openEditUser(u)"
                    title="Modifier"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifier
                  </button>
                  <button
                    v-if="u._local && u.id !== 'admin-001'"
                    class="btn btn-ghost btn-xs action-btn delete-btn"
                    @click="deleteUser(u)"
                    title="Supprimer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="uTotalPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="uPage === 1" @click="uPage--">{{ $t('admin.prev') }}</button>
        <span class="page-info">{{ uPage }} / {{ uTotalPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="uPage === uTotalPages" @click="uPage++">{{ $t('admin.next') }}</button>
      </div>
    </div>

    <!-- ═══ ONGLET ADRESSES ═══ -->
    <div v-if="tab === 'addresses'" class="card table-card">
      <div class="filters-bar">
        <div class="filter-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="aSearch" type="search" class="search-input" :placeholder="$t('admin.filters.label_code')"/>
        </div>
        <select v-model="aStatus" class="form-select filter-select">
          <option value="">{{ $t('admin.filters.all_statuses') }}</option>
          <option value="verified">{{ $t('address.status.verified') }}</option>
          <option value="pending">{{ $t('address.status.pending') }}</option>
          <option value="draft">{{ $t('address.status.draft') }}</option>
        </select>
        <select v-model="aCity" class="form-select filter-select" @change="aNeighborhood=''">
          <option value="">{{ $t('admin.filters.all_cities') }}</option>
          <option v-for="c in addrCities" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="aNeighborhood" class="form-select filter-select">
          <option value="">{{ $t('admin.filters.all_neighborhoods') }}</option>
          <option v-for="n in addrNeighborhoods" :key="n" :value="n">{{ n }}</option>
        </select>
        <button v-if="aSearch || aStatus || aCity || aNeighborhood" class="btn btn-ghost btn-sm reset-btn" @click="aSearch='';aStatus='';aCity='';aNeighborhood=''">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          {{ $t('admin.filters.reset') }}
        </button>
        <button class="btn btn-ghost btn-sm" @click="refreshLocalAddresses" title="Actualiser">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
        <span class="filter-count">{{ filteredAddresses.length }} {{ $t('admin.filters.results') }}</span>
      </div>

      <div v-if="addrLoading" class="table-loading">
        <div v-for="i in 4" :key="i" class="skeleton" style="height:52px;border-radius:8px;margin-bottom:8px"></div>
      </div>
      <div v-else-if="filteredAddresses.length === 0" class="empty-state" style="padding:40px">
        <p>{{ $t('admin.empty_addresses') }}</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t('admin.table.code') }}</th>
              <th>{{ $t('admin.table.label_col') }}</th>
              <th>{{ $t('admin.table.street_neighborhood') }}</th>
              <th>{{ $t('admin.table.city') }}</th>
              <th>{{ $t('admin.table.status') }}</th>
              <th>{{ $t('admin.table.date') }}</th>
              <th>{{ $t('admin.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in paginatedAddresses" :key="a.id">
              <td><span class="addr-code">{{ a.addressCode }}</span></td>
              <td><strong>{{ a.label }}</strong></td>
              <td class="muted">{{ a.street }}, {{ a.neighborhood }}</td>
              <td class="muted">{{ a.city }}</td>
              <td>
                <span class="status-badge" :class="`status-${a.status}`">
                  {{ statusLabel(a.status) }}
                </span>
              </td>
              <td class="muted">{{ fmtDate(a.createdAt) }}</td>
              <td>
                <div class="row-actions">
                  <template v-if="a._userId">
                    <button
                      v-if="a.status === 'pending'"
                      class="btn btn-ghost btn-xs action-btn verify-btn"
                      @click="verifyAddress(a)"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Valider
                    </button>
                    <button
                      v-if="a.status === 'pending'"
                      class="btn btn-ghost btn-xs action-btn reject-btn"
                      @click="rejectAddress(a)"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Refuser
                    </button>
                    <span v-if="a.status === 'verified'" class="verified-chip">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Vérifié
                    </span>
                    <button
                      class="btn btn-ghost btn-xs action-btn edit-btn"
                      @click="openEditAddr(a)"
                      title="Modifier"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Modifier
                    </button>
                    <button
                      class="btn btn-ghost btn-xs action-btn delete-btn"
                      @click="deleteAddr(a)"
                      title="Supprimer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      Supprimer
                    </button>
                  </template>
                  <span v-else class="muted">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="aTotalPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="aPage === 1" @click="aPage--">{{ $t('admin.prev') }}</button>
        <span class="page-info">{{ aPage }} / {{ aTotalPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="aPage === aTotalPages" @click="aPage++">{{ $t('admin.next') }}</button>
      </div>
    </div>

    <!-- ═══ ONGLET MESSAGES ═══ -->
    <div v-if="tab === 'messages'" class="card table-card">
      <div class="inbox-header">
        <h3 class="inbox-title">{{ $t('admin.admin_inbox') }}</h3>
        <div class="inbox-header-badges">
          <span class="ticket-badge ticket-open">{{ msgStore.adminUnreadCount }} non traité(s)</span>
          <span class="ticket-badge ticket-done">{{ msgStore.adminInbox.filter(m => m.read).length }} traité(s)</span>
        </div>
      </div>

      <div v-if="msgStore.adminInbox.length === 0" class="empty-state" style="padding:40px">
        <div class="empty-icon-sm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <p>{{ $t('admin.inbox_empty') }}</p>
      </div>

      <div v-else class="inbox-list">
        <div
          v-for="msg in msgStore.adminInbox"
          :key="msg.id"
          class="inbox-item"
          :class="{ 'inbox-unread': !msg.read, 'inbox-selected': selectedInboxMsg?.id === msg.id }"
          @click="openInboxMsg(msg)"
          role="button"
          tabindex="0"
          @keydown.enter="openInboxMsg(msg)"
        >
          <div class="inbox-item-left">
            <div class="mini-avatar" :style="{ background: avatarBg(msg.fromName) }">
              {{ initials(msg.fromName) }}
            </div>
            <div class="inbox-item-content">
              <div class="inbox-from">
                <span class="inbox-from-name">{{ msg.fromName }}</span>
                <span class="ticket-status-pill" :class="msg.read ? 'pill-done' : 'pill-open'">
                  {{ msg.read ? 'Traité' : 'Non traité' }}
                </span>
              </div>
              <div class="inbox-subject" :class="{ bold: !msg.read }">{{ msg.subject }}</div>
              <p class="inbox-preview">{{ msg.body.split('\n').find(l => l.trim()) || '' }}</p>
            </div>
          </div>
          <div class="inbox-item-right">
            <time class="inbox-date">{{ fmtDate(msg.createdAt) }}</time>
            <div class="inbox-actions">
              <button
                v-if="msg.fromUserId"
                class="btn btn-ghost btn-xs action-btn"
                @click.stop="openReplyTo(msg)"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                </svg>
                {{ $t('admin.reply') }}
              </button>
              <button
                v-if="!msg.read"
                class="btn btn-ghost btn-xs action-btn btn-traite"
                @click.stop="handleTraiter(msg)"
                title="Marquer comme traité et notifier l'utilisateur"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Traiter
              </button>
              <button
                v-else
                class="btn btn-ghost btn-xs action-btn btn-untraite"
                @click.stop="msgStore.markAdminUnread(msg.id)"
                title="Marquer comme non traité"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Rouvrir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- ═══ MODALS ═══ -->
  <Teleport to="body">
    <!-- Compose admin → user -->
    <Transition name="fade">
      <div v-if="compose.show" class="modal-overlay" @click="compose.show = false" aria-hidden="true"></div>
    </Transition>
    <Transition name="compose-up">
      <div v-if="compose.show" class="compose-modal card" role="dialog">
        <div class="compose-header">
          <div>
            <span class="compose-title">{{ $t('admin.compose_title') }}</span>
            <span v-if="compose.toUser" class="compose-to">→ {{ compose.toUser.name }} ({{ compose.toUser.email }})</span>
          </div>
          <button class="btn btn-ghost btn-icon" @click="compose.show = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="compose-body">
          <div class="form-group">
            <label class="form-label">{{ $t('admin.compose_subject') }}</label>
            <input v-model="compose.subject" type="text" class="form-input" placeholder="Sujet du message" maxlength="100"/>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('admin.compose_body') }}</label>
            <textarea v-model="compose.body" class="form-input compose-textarea" placeholder="Votre message..." rows="5" maxlength="2000"></textarea>
          </div>
        </div>
        <div class="compose-footer">
          <button class="btn btn-ghost btn-sm" @click="compose.show = false">{{ $t('common.cancel') }}</button>
          <button
            class="btn btn-primary btn-sm"
            :disabled="!compose.subject.trim() || !compose.body.trim() || compose.sending"
            @click="submitCompose"
          >
            <svg v-if="compose.sending" class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            {{ $t('admin.compose_send') }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Reply panel (reading + replying to a user message) -->
    <Transition name="fade">
      <div v-if="selectedInboxMsg" class="modal-overlay" @click="selectedInboxMsg = null" aria-hidden="true"></div>
    </Transition>
    <Transition name="slide-panel">
      <div v-if="selectedInboxMsg" class="read-panel" role="dialog">
        <div class="read-panel-inner">
          <div class="read-panel-header">
            <button class="btn btn-ghost btn-icon" @click="selectedInboxMsg = null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <span class="panel-title">{{ $t('admin.from_user') }} : {{ selectedInboxMsg.fromName }}</span>
          </div>
          <div class="read-panel-content">
            <h2 class="read-subject">{{ selectedInboxMsg.subject }}</h2>
            <div class="read-meta">
              <div class="read-from">
                <div class="mini-avatar" :style="{ background: avatarBg(selectedInboxMsg.fromName) }">
                  {{ initials(selectedInboxMsg.fromName) }}
                </div>
                <div>
                  <div class="read-from-name">{{ selectedInboxMsg.fromName }}</div>
                  <div class="read-from-role">Utilisateur findMe</div>
                </div>
              </div>
              <time class="read-date">{{ fmtDate(selectedInboxMsg.createdAt) }}</time>
            </div>
            <div class="read-body">
              <p v-for="(line, i) in selectedInboxMsg.body.split('\n')" :key="i">{{ line || ' ' }}</p>
            </div>

            <!-- Zone de réponse -->
            <div v-if="selectedInboxMsg.fromUserId" class="reply-zone">
              <h4 class="reply-zone-title">{{ $t('admin.reply') }}</h4>
              <div class="form-group">
                <input v-model="replyForm.subject" type="text" class="form-input" placeholder="Sujet"/>
              </div>
              <div class="form-group">
                <textarea v-model="replyForm.body" class="form-input compose-textarea" placeholder="Votre réponse..." rows="4"></textarea>
              </div>
              <button
                class="btn btn-primary btn-sm"
                :disabled="!replyForm.body.trim() || replyForm.sending"
                @click="submitReply"
              >
                {{ $t('admin.compose_send') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ Modal utilisateur (créer / modifier) ══ -->
    <Transition name="fade">
      <div v-if="userModal.show" class="modal-overlay" @click="userModal.show = false" aria-hidden="true"></div>
    </Transition>
    <Transition name="compose-up">
      <div v-if="userModal.show" class="compose-modal card" role="dialog" style="width:min(520px,calc(100vw - 32px))">
        <div class="compose-header">
          <span class="compose-title">{{ userModal.mode === 'create' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur' }}</span>
          <button class="btn btn-ghost btn-icon" @click="userModal.show = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="compose-body" style="gap:12px">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nom complet *</label>
              <input v-model="userModal.form.name" type="text" class="form-input" placeholder="Prénom Nom"/>
            </div>
            <div class="form-group">
              <label class="form-label">Ville</label>
              <input v-model="userModal.form.city" type="text" class="form-input" placeholder="Ex: Douala"/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="userModal.form.email" type="email" class="form-input" placeholder="email@exemple.com"/>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Rôle</label>
              <select v-model="userModal.form.role" class="form-select form-input">
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div class="form-group" v-if="userModal.mode === 'create'">
              <label class="form-label">Mot de passe *</label>
              <input v-model="userModal.form.password" type="password" class="form-input" placeholder="Minimum 8 caractères"/>
            </div>
          </div>
          <p v-if="userModal.error" class="form-error">{{ userModal.error }}</p>
        </div>
        <div class="compose-footer">
          <button class="btn btn-ghost btn-sm" @click="userModal.show = false">Annuler</button>
          <button class="btn btn-primary btn-sm" @click="saveUser">
            {{ userModal.mode === 'create' ? 'Créer' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- ══ Modal adresse (modifier) ══ -->
    <Transition name="fade">
      <div v-if="addrModal.show" class="modal-overlay" @click="addrModal.show = false" aria-hidden="true"></div>
    </Transition>
    <Transition name="compose-up">
      <div v-if="addrModal.show" class="compose-modal card" role="dialog" style="width:min(560px,calc(100vw - 32px))">
        <div class="compose-header">
          <span class="compose-title">Modifier l'adresse</span>
          <button class="btn btn-ghost btn-icon" @click="addrModal.show = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="compose-body" style="gap:12px">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Label *</label>
              <input v-model="addrModal.form.label" type="text" class="form-input" placeholder="Ex: Domicile"/>
            </div>
            <div class="form-group">
              <label class="form-label">Statut</label>
              <select v-model="addrModal.form.status" class="form-select form-input">
                <option value="pending">En attente</option>
                <option value="verified">Vérifié</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Pays</label>
              <input v-model="addrModal.form.country" type="text" class="form-input"/>
            </div>
            <div class="form-group">
              <label class="form-label">Ville</label>
              <input v-model="addrModal.form.city" type="text" class="form-input"/>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quartier</label>
              <input v-model="addrModal.form.neighborhood" type="text" class="form-input"/>
            </div>
            <div class="form-group">
              <label class="form-label">Rue</label>
              <input v-model="addrModal.form.street" type="text" class="form-input"/>
            </div>
          </div>
        </div>
        <div class="compose-footer">
          <button class="btn btn-ghost btn-sm" @click="addrModal.show = false">Annuler</button>
          <button class="btn btn-primary btn-sm" @click="saveAddr">Enregistrer</button>
        </div>
      </div>
    </Transition>

  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSeoMeta } from '#imports'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useMessageStore } from '../../stores/messages'
import { useToast } from '../../composables/useToast'
import type { Message } from '../../stores/messages'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Administration — findMe' })

const { t } = useI18n()
const authStore = useAuthStore()
const msgStore = useMessageStore()
const { showToast } = useToast()

// ── Tab actif ──────────────────────────────────────────────
const tab = ref<'users' | 'addresses' | 'messages'>('users')

// ── Stats calculées depuis les vraies données ──────────────
const statsLoading = computed(() => usersLoading.value || addrLoading.value)
const stats = computed(() => {
  const now = new Date()
  const thisMonth = (d: string) => {
    if (!d) return false
    const dt = new Date(d)
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()
  }
  return {
    totalUsers: users.value.length,
    newMonth: users.value.filter(u => thisMonth(u.createdAt)).length,
    totalAddresses: addresses.value.length,
    verifiedMonth: addresses.value.filter(a => a.status === 'verified').length,
    openTickets: msgStore.adminInbox.filter(m => !m.read).length,
    resolvedMonth: msgStore.adminInbox.filter(m => m.read).length,
  }
})

// ── Utilisateurs ───────────────────────────────────────────
const usersLoading = ref(true)
const users = ref<any[]>([])
const uSearch = ref('')
const uRole = ref('')
const uCity = ref('')
const uPage = ref(1)
const perPage = 10

// ── Adresses ───────────────────────────────────────────────
const addrLoading = ref(true)
const addresses = ref<any[]>([])
const aSearch = ref('')
const aStatus = ref('')
const aCity = ref('')
const aNeighborhood = ref('')
const aPage = ref(1)

// ── Compose (admin → user) ─────────────────────────────────
const compose = ref({ show: false, toUser: null as any, subject: '', body: '', sending: false })

// ── Modal utilisateur CRUD ─────────────────────────────────
const userModal = ref({
  show: false,
  mode: 'create' as 'create' | 'edit',
  error: '',
  form: { id: '', name: '', email: '', role: 'user', city: '', password: '' },
})

// ── Modal adresse CRUD ─────────────────────────────────────
const addrModal = ref({
  show: false,
  form: { id: '', label: '', country: '', city: '', neighborhood: '', street: '', status: 'pending', _userId: '' },
})

// ── Inbox reader + reply ───────────────────────────────────
const selectedInboxMsg = ref<Message | null>(null)
const replyForm = ref({ subject: '', body: '', sending: false })

onMounted(() => {
  if (!process.client) {
    usersLoading.value = false
    addrLoading.value = false
    return
  }

  // ── Utilisateurs : localStorage uniquement (données réelles) ──
  try {
    const localRaw = localStorage.getItem('findme_local_users')
    const localUsers: any[] = localRaw ? JSON.parse(localRaw) : []
    users.value = localUsers.map(u => {
      let addrCount = 0
      try {
        const raw = localStorage.getItem(`findme_addresses_${u.id}`)
        addrCount = raw ? JSON.parse(raw).length : 0
      } catch {}
      return {
        id: u.id, name: u.name, email: u.email,
        role: u.role || 'user', city: u.city || '',
        addressCount: addrCount,
        createdAt: u.createdAt || new Date().toISOString(),
        _local: true,
      }
    })
  } catch {
    users.value = []
  } finally {
    usersLoading.value = false
  }

  // ── Adresses : localStorage uniquement (données réelles) ──
  try {
    const localUsersRaw = localStorage.getItem('findme_local_users')
    const localUsers: any[] = localUsersRaw ? JSON.parse(localUsersRaw) : []
    const localAddrs: any[] = []
    for (const u of localUsers) {
      const raw = localStorage.getItem(`findme_addresses_${u.id}`)
      if (!raw) continue
      JSON.parse(raw).forEach((a: any) => localAddrs.push({ ...a, _userId: u.id }))
    }
    addresses.value = localAddrs
  } catch {
    addresses.value = []
  } finally {
    addrLoading.value = false
  }

  // Admin inbox
  msgStore.fetchAdminInbox()
})

// ── Filtres utilisateurs ───────────────────────────────────
const userCities = computed(() => [...new Set(users.value.map(u => u.city).filter(Boolean))].sort())

const filteredUsers = computed(() => {
  let list = users.value
  if (uSearch.value) {
    const q = uSearch.value.toLowerCase()
    list = list.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
  }
  if (uRole.value) list = list.filter(u => u.role === uRole.value)
  if (uCity.value) list = list.filter(u => u.city === uCity.value)
  return list
})
const uTotalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / perPage)))
const paginatedUsers = computed(() => filteredUsers.value.slice((uPage.value - 1) * perPage, uPage.value * perPage))

// ── Filtres adresses ───────────────────────────────────────
const addrCities = computed(() => [...new Set(addresses.value.map(a => a.city).filter(Boolean))].sort())
const addrNeighborhoods = computed(() => {
  const base = aCity.value ? addresses.value.filter(a => a.city === aCity.value) : addresses.value
  return [...new Set(base.map(a => a.neighborhood).filter(Boolean))].sort()
})

const filteredAddresses = computed(() => {
  let list = addresses.value
  if (aSearch.value) {
    const q = aSearch.value.toLowerCase()
    list = list.filter(a => (a.label || '').toLowerCase().includes(q) || (a.addressCode || '').toLowerCase().includes(q))
  }
  if (aStatus.value) list = list.filter(a => a.status === aStatus.value)
  if (aCity.value) list = list.filter(a => a.city === aCity.value)
  if (aNeighborhood.value) list = list.filter(a => a.neighborhood === aNeighborhood.value)
  return list
})
const aTotalPages = computed(() => Math.max(1, Math.ceil(filteredAddresses.value.length / perPage)))
const paginatedAddresses = computed(() => filteredAddresses.value.slice((aPage.value - 1) * perPage, aPage.value * perPage))

// ── Helpers ────────────────────────────────────────────────
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const initials = (name: string) => (name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
const avatarBg = (name: string) => {
  const colors = ['#185FA5', '#0C6B3A', '#0C447C', '#854F0B']
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}
const statusLabel = (s: string) => ({
  verified: t('address.status.verified'),
  pending: t('address.status.pending'),
  draft: t('address.status.draft'),
}[s] || s)

// Rafraîchit les données locales à chaque changement d'onglet
watch(tab, (val) => {
  if (val === 'users') refreshLocalUsers()
  if (val === 'addresses') refreshLocalAddresses()
})

// ── Actualisation : garde Postman + relit localStorage ────
const refreshLocalUsers = () => {
  if (!process.client) return
  try {
    const localRaw = localStorage.getItem('findme_local_users')
    const localUsers: any[] = localRaw ? JSON.parse(localRaw) : []
    const apiUsers = users.value.filter((u: any) => !u._local)
    const apiEmails = new Set(apiUsers.map((u: any) => u.email))
    const localMapped = localUsers
      .filter(u => !apiEmails.has(u.email))
      .map(u => {
        let addrCount = 0
        try {
          const raw = localStorage.getItem(`findme_addresses_${u.id}`)
          addrCount = raw ? JSON.parse(raw).length : 0
        } catch {}
        return {
          id: u.id, name: u.name, email: u.email,
          role: u.role || 'user', city: u.city || '',
          addressCount: addrCount,
          createdAt: u.createdAt || new Date().toISOString(),
          _local: true,
        }
      })
    users.value = [...apiUsers, ...localMapped]
  } catch {}
}

// ── Actualisation : garde Postman + relit localStorage ────
const refreshLocalAddresses = () => {
  if (!process.client) return
  try {
    const localUsersRaw = localStorage.getItem('findme_local_users')
    const localUsers: any[] = localUsersRaw ? JSON.parse(localUsersRaw) : []
    const apiAddrs = addresses.value.filter((a: any) => !a._userId)
    const apiIds = new Set(apiAddrs.map((a: any) => a.id))
    const localAddrs: any[] = []
    for (const u of localUsers) {
      const raw = localStorage.getItem(`findme_addresses_${u.id}`)
      if (!raw) continue
      JSON.parse(raw).forEach((a: any) => {
        if (!apiIds.has(a.id)) localAddrs.push({ ...a, _userId: u.id })
      })
    }
    addresses.value = [...apiAddrs, ...localAddrs]
  } catch {}
}

// ── CRUD Utilisateurs ─────────────────────────────────────
const openCreateUser = () => {
  userModal.value = { show: true, mode: 'create', error: '', form: { id: '', name: '', email: '', role: 'user', city: '', password: '' } }
}

const openEditUser = (u: any) => {
  userModal.value = { show: true, mode: 'edit', error: '', form: { id: u.id, name: u.name, email: u.email, role: u.role || 'user', city: u.city || '', password: '' } }
}

const saveUser = () => {
  const f = userModal.value.form
  if (!f.name.trim() || !f.email.trim()) { userModal.value.error = 'Nom et email sont obligatoires.'; return }
  if (userModal.value.mode === 'create' && !f.password.trim()) { userModal.value.error = 'Mot de passe obligatoire.'; return }

  if (!process.client) return
  const raw = localStorage.getItem('findme_local_users')
  const localUsers: any[] = raw ? JSON.parse(raw) : []

  if (userModal.value.mode === 'create') {
    const exists = localUsers.find((u: any) => u.email.toLowerCase() === f.email.toLowerCase())
    if (exists) { userModal.value.error = 'Cet email est déjà utilisé.'; return }
    const newUser = {
      id: `user_${Date.now()}`,
      name: f.name.trim(),
      email: f.email.trim().toLowerCase(),
      role: f.role,
      city: f.city.trim(),
      passwordKey: btoa(`${f.email.toLowerCase()}:${f.password}`),
      createdAt: new Date().toISOString(),
    }
    localUsers.push(newUser)
    localStorage.setItem('findme_local_users', JSON.stringify(localUsers))
    showToast('Utilisateur créé', 'success')
  } else {
    const idx = localUsers.findIndex((u: any) => u.id === f.id)
    if (idx !== -1) {
      localUsers[idx] = { ...localUsers[idx], name: f.name.trim(), email: f.email.trim().toLowerCase(), role: f.role, city: f.city.trim() }
      localStorage.setItem('findme_local_users', JSON.stringify(localUsers))
      showToast('Utilisateur modifié', 'success')
    }
  }
  userModal.value.show = false
  refreshLocalUsers()
}

const deleteUser = (u: any) => {
  if (!process.client || !u._local) return
  if (!confirm(`Supprimer l'utilisateur "${u.name}" ? Cette action est irréversible.`)) return
  const raw = localStorage.getItem('findme_local_users')
  const localUsers: any[] = raw ? JSON.parse(raw) : []
  const updated = localUsers.filter((lu: any) => lu.id !== u.id)
  localStorage.setItem('findme_local_users', JSON.stringify(updated))
  localStorage.removeItem(`findme_addresses_${u.id}`)
  showToast('Utilisateur supprimé', 'error')
  refreshLocalUsers()
  refreshLocalAddresses()
}

// ── CRUD Adresses ─────────────────────────────────────────
const openEditAddr = (a: any) => {
  addrModal.value = {
    show: true,
    form: { id: a.id, label: a.label, country: a.country, city: a.city, neighborhood: a.neighborhood, street: a.street, status: a.status, _userId: a._userId },
  }
}

const saveAddr = () => {
  const f = addrModal.value.form
  if (!f.label.trim()) return
  if (!process.client || !f._userId) return
  const key = `findme_addresses_${f._userId}`
  const raw = localStorage.getItem(key)
  if (!raw) return
  const addrs: any[] = JSON.parse(raw)
  const idx = addrs.findIndex((a: any) => a.id === f.id)
  if (idx === -1) return
  const prev = addrs[idx]
  addrs[idx] = { ...prev, label: f.label.trim(), country: f.country, city: f.city, neighborhood: f.neighborhood, street: f.street, status: f.status, updatedAt: new Date().toISOString() }
  localStorage.setItem(key, JSON.stringify(addrs))
  const uiAddr = addresses.value.find((a: any) => a.id === f.id)
  if (uiAddr) Object.assign(uiAddr, addrs[idx])
  addrModal.value.show = false
  showToast('Adresse modifiée', 'success')
  if (f.status === 'verified' && prev.status !== 'verified') {
    msgStore.sendToUser(f._userId, `Adresse "${f.label}" vérifiée`, `Bonjour,\n\nVotre adresse "${f.label}" a été mise à jour et marquée comme vérifiée.\n\nCordialement,\nL'équipe findMe`)
  }
}

const deleteAddr = (a: any) => {
  if (!process.client || !a._userId) return
  if (!confirm(`Supprimer l'adresse "${a.label}" ? Cette action est irréversible.`)) return
  const key = `findme_addresses_${a._userId}`
  const raw = localStorage.getItem(key)
  if (!raw) return
  const addrs: any[] = JSON.parse(raw)
  localStorage.setItem(key, JSON.stringify(addrs.filter((ad: any) => ad.id !== a.id)))
  addresses.value = addresses.value.filter((ad: any) => ad.id !== a.id)
  showToast('Adresse supprimée', 'error')
  refreshLocalUsers()
}

// ── Traitement ticket support avec notification utilisateur ──
const handleTraiter = (msg: Message) => {
  msgStore.markAdminRead(msg.id)
  if (msg.fromUserId) {
    msgStore.sendToUser(
      msg.fromUserId,
      `Votre demande a été traitée : ${msg.subject}`,
      `Bonjour,\n\nNous vous informons que votre demande de support concernant "${msg.subject}" a été traitée par notre équipe.\n\nSi vous avez d'autres questions ou si le problème persiste, n'hésitez pas à nous contacter à nouveau via le formulaire de support.\n\nCordialement,\nL'équipe findMe`,
    )
    showToast('Ticket traité — utilisateur notifié', 'success')
  } else {
    showToast('Ticket marqué comme traité', 'success')
  }
}

// ── Vérification / Refus d'adresse ───────────────────────
const verifyAddress = (addr: any) => {
  if (!process.client || !addr._userId) return
  const key = `findme_addresses_${addr._userId}`
  const raw = localStorage.getItem(key)
  if (!raw) return
  const addrs: any[] = JSON.parse(raw)
  const found = addrs.find((a: any) => a.id === addr.id)
  if (!found) return
  found.status = 'verified'
  localStorage.setItem(key, JSON.stringify(addrs))
  const uiAddr = addresses.value.find((a: any) => a.id === addr.id)
  if (uiAddr) uiAddr.status = 'verified'
  msgStore.sendToUser(
    addr._userId,
    t('admin.verify_notification_subject'),
    `Bonjour,\n\nNous avons le plaisir de vous informer que votre adresse "${addr.label}" (code ${addr.addressCode}) a été vérifiée et validée par notre équipe.\n\nVous pouvez maintenant utiliser ce code pour recevoir des livraisons et des services.\n\nCordialement,\nL'équipe findMe`,
  )
  showToast(t('admin.verify_success'), 'success')
}

const rejectAddress = (addr: any) => {
  if (!process.client || !addr._userId) return
  const key = `findme_addresses_${addr._userId}`
  const raw = localStorage.getItem(key)
  if (!raw) return
  const addrs: any[] = JSON.parse(raw)
  const found = addrs.find((a: any) => a.id === addr.id)
  if (!found) return
  found.status = 'draft'
  localStorage.setItem(key, JSON.stringify(addrs))
  const uiAddr = addresses.value.find((a: any) => a.id === addr.id)
  if (uiAddr) uiAddr.status = 'draft'
  msgStore.sendToUser(
    addr._userId,
    `Adresse "${addr.label}" — corrections requises`,
    `Bonjour,\n\nNous avons examiné votre adresse "${addr.label}" (code : ${addr.addressCode}) et nous ne pouvons pas la valider en l'état.\n\nVeuillez vérifier les informations saisies (localisation GPS, rue, quartier) et la soumettre à nouveau.\n\nSi vous avez des questions, contactez-nous via le formulaire de support.\n\nCordialement,\nL'équipe findMe`,
  )
  showToast('Adresse refusée — utilisateur notifié', 'error')
}

// ── Compose admin → user ──────────────────────────────────
const openComposeTo = (user: any) => {
  compose.value = { show: true, toUser: user, subject: '', body: '', sending: false }
}

const submitCompose = () => {
  if (!compose.value.subject.trim() || !compose.value.body.trim()) return
  compose.value.sending = true
  msgStore.sendToUser(compose.value.toUser.id, compose.value.subject, compose.value.body)
  compose.value.sending = false
  compose.value.show = false
  showToast(t('admin.compose_sent'), 'success')
}

// ── Admin inbox — lecture et réponse ─────────────────────
const openInboxMsg = (msg: Message) => {
  msgStore.markAdminRead(msg.id)
  selectedInboxMsg.value = msg
  replyForm.value = { subject: `Re: ${msg.subject}`, body: '', sending: false }
}

const openReplyTo = (msg: Message) => {
  openInboxMsg(msg)
}

const submitReply = () => {
  const target = selectedInboxMsg.value
  if (!target?.fromUserId || !replyForm.value.body.trim()) return
  replyForm.value.sending = true
  msgStore.sendToUser(target.fromUserId, replyForm.value.subject, replyForm.value.body)
  replyForm.value.sending = false
  selectedInboxMsg.value = null
  showToast(t('admin.compose_sent'), 'success')
}
</script>

<style scoped>
.admin-dashboard { padding: 32px; max-width: 1200px; }

.admin-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 32px; flex-wrap: wrap;
}
.admin-header h1 { font-size: 28px; margin-bottom: 4px; }
.admin-sub { font-size: 14px; color: var(--color-text-secondary); }

/* ── Stats ── */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
.stat-icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
.stat-value { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--color-text-primary); line-height: 1; }
.stat-label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.stat-trend { font-size: 12px; color: var(--color-text-tertiary); }

/* ── Onglets ── */
.tabs-bar {
  display: flex; gap: 4px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 4px; margin-bottom: 16px;
  width: fit-content;
}
.tab {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 20px; border-radius: var(--radius-lg);
  border: none; background: none; cursor: pointer;
  font-size: 14px; font-weight: 500;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.tab.active {
  background: var(--color-surface);
  color: var(--color-primary); font-weight: 600;
  box-shadow: var(--shadow-sm);
}
.tab-count {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 11px; font-weight: 700;
  padding: 2px 7px; border-radius: var(--radius-full);
}
.tab.active .tab-count { background: var(--color-primary); color: white; }
.tab-count-alert { background: var(--color-error) !important; color: white !important; }

/* ── Table ── */
.table-card { padding: 0; overflow: hidden; }
.filters-bar {
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap; padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}
.filter-search {
  display: flex; align-items: center; gap: 8px;
  flex: 1; min-width: 200px; color: var(--color-text-tertiary);
}
.search-input {
  flex: 1; border: none; background: none;
  font-size: 14px; color: var(--color-text-primary); outline: none;
}
.filter-select { width: 150px; padding: 8px 10px; font-size: 13px; }
.reset-btn { color: var(--color-error); }
.filter-count { font-size: 12px; color: var(--color-text-tertiary); margin-left: auto; white-space: nowrap; }

.table-loading { padding: 20px; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 11px 16px; text-align: left;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.6px; color: var(--color-text-tertiary);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary); white-space: nowrap;
}
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px; color: var(--color-text-primary);
  vertical-align: middle;
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: var(--color-bg-secondary); }

.user-cell { display: flex; align-items: center; gap: 10px; }
.mini-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  color: white; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.user-name { font-weight: 600; font-size: 13px; }
.user-id { font-size: 11px; color: var(--color-text-tertiary); font-family: monospace; }
.count-bubble {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--color-primary-light); color: var(--color-primary);
  font-size: 11px; font-weight: 700;
}
.addr-code {
  font-family: monospace; font-size: 12px; font-weight: 700;
  background: var(--color-bg-secondary); padding: 3px 7px; border-radius: 4px;
}
.muted { color: var(--color-text-secondary); }

.status-badge {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: var(--radius-full);
}
.status-verified { background: #E6F4ED; color: #0C6B3A; }
.status-pending  { background: #FEF3E2; color: #854F0B; }
.status-draft    { background: var(--color-bg-secondary); color: var(--color-text-secondary); }

.action-btn {
  font-size: 11px; gap: 4px; padding: 4px 9px;
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  white-space: nowrap;
}
.row-actions { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
.addr-actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.edit-btn { color: #185FA5; border-color: rgba(24,95,165,0.2); }
.edit-btn:hover { background: #E6F1FB; }
.delete-btn { color: #B91C1C; border-color: rgba(185,28,28,0.2); }
.delete-btn:hover { background: #FEE2E2; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
.verify-btn { color: #0C6B3A; border-color: rgba(12,107,58,0.2); }
.verify-btn:hover { background: #E6F4ED; }
.reject-btn { color: #B91C1C; border-color: rgba(185,28,28,0.2); }
.reject-btn:hover { background: #FEE2E2; }
.verified-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; color: #0C6B3A; font-weight: 600;
}

.empty-state { text-align: center; color: var(--color-text-secondary); }
.empty-icon-sm {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--color-primary-light);
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}

.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 14px;
  border-top: 1px solid var(--color-border);
}
.page-info { font-size: 13px; color: var(--color-text-secondary); }

/* ── Admin Inbox ── */
.inbox-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}
.inbox-title { font-size: 15px; font-weight: 700; margin: 0; }
.inbox-header-badges { display: flex; gap: 8px; align-items: center; }
.ticket-badge {
  font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: var(--radius-full);
}
.ticket-open { background: #FEE2E2; color: #B91C1C; }
.ticket-done { background: #E6F4ED; color: #0C6B3A; }

.ticket-status-pill {
  font-size: 10px; font-weight: 700; padding: 2px 8px;
  border-radius: var(--radius-full); flex-shrink: 0;
}
.pill-open { background: #FEE2E2; color: #B91C1C; }
.pill-done { background: #E6F4ED; color: #0C6B3A; }

.inbox-actions { display: flex; gap: 6px; align-items: center; }
.btn-traite { color: #0C6B3A; border-color: rgba(12,107,58,0.25); }
.btn-traite:hover { background: #E6F4ED; }
.btn-untraite { color: #854F0B; border-color: rgba(133,79,11,0.25); }
.btn-untraite:hover { background: #FEF3E2; }
.inbox-list { display: flex; flex-direction: column; }
.inbox-item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 20px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer; transition: background 150ms;
}
.inbox-item:hover { background: var(--color-bg-secondary); }
.inbox-item:last-child { border-bottom: none; }
.inbox-unread { border-left: 3px solid var(--color-primary); background: var(--color-primary-light); }
.inbox-selected { background: var(--color-primary-light) !important; }
.inbox-item-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; min-width: 0; }
.inbox-item-content { flex: 1; min-width: 0; }
.inbox-from { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
.inbox-from-name { font-size: 13px; font-weight: 600; }
.unread-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-primary); flex-shrink: 0; }
.inbox-subject { font-size: 13px; margin-bottom: 3px; }
.inbox-subject.bold { font-weight: 700; }
.inbox-preview { font-size: 12px; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.inbox-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.inbox-date { font-size: 11px; color: var(--color-text-tertiary); }

/* ── Modals / panels ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4); z-index: 200;
  backdrop-filter: blur(2px);
}
.compose-modal {
  position: fixed; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: min(540px, calc(100vw - 32px));
  z-index: 201; padding: 0; overflow: hidden;
  box-shadow: var(--shadow-xl);
}
.compose-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--color-border);
}
.compose-title { font-size: 15px; font-weight: 700; display: block; }
.compose-to { font-size: 12px; color: var(--color-text-secondary); }
.compose-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.compose-textarea { resize: vertical; min-height: 120px; }
.compose-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 20px; border-top: 1px solid var(--color-border);
}

.read-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(480px, 100vw);
  background: var(--color-surface); z-index: 201;
  display: flex; flex-direction: column;
  box-shadow: -4px 0 32px rgba(0,0,0,0.15);
}
.read-panel-inner { display: flex; flex-direction: column; height: 100%; }
.read-panel-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid var(--color-border); flex-shrink: 0;
}
.panel-title { font-size: 14px; font-weight: 700; color: var(--color-text-primary); }
.read-panel-content { flex: 1; overflow-y: auto; padding: 24px; }
.read-subject { font-size: 18px; font-weight: 700; margin-bottom: 14px; line-height: 1.3; }
.read-meta {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; margin-bottom: 20px; padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}
.read-from { display: flex; gap: 10px; align-items: center; }
.read-from-name { font-size: 13px; font-weight: 600; }
.read-from-role { font-size: 11px; color: var(--color-text-secondary); }
.read-date { font-size: 11px; color: var(--color-text-tertiary); white-space: nowrap; }
.read-body { font-size: 13px; line-height: 1.75; color: var(--color-text-primary); }
.read-body p { margin-bottom: 4px; }

.reply-zone {
  margin-top: 24px; padding-top: 20px;
  border-top: 1px solid var(--color-border);
  display: flex; flex-direction: column; gap: 10px;
}
.reply-zone-title { font-size: 14px; font-weight: 700; margin: 0; }

/* Transitions */
.compose-up-enter-active, .compose-up-leave-active { transition: all 220ms cubic-bezier(.4,0,.2,1); }
.compose-up-enter-from, .compose-up-leave-to { opacity: 0; transform: translate(-50%, -48%) scale(.96); }

.slide-panel-enter-active, .slide-panel-leave-active { transition: transform 250ms cubic-bezier(.4,0,.2,1); }
.slide-panel-enter-from, .slide-panel-leave-to { transform: translateX(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .admin-dashboard { padding: 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .tabs-bar { width: 100%; overflow-x: auto; }
}
</style>
