<template>
  <div class="support-page">
    <div class="page-header">
      <h1>{{ $t('support.title') }}</h1>
      <p class="page-sub">{{ $t('support.subtitle') }}</p>
    </div>

    <div class="support-grid">
      <!-- Formulaire -->
      <div class="card support-form-card">
        <div v-if="sent" class="success-state">
          <div class="success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0C6B3A" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3>{{ $t('support_page.sent_title') }}</h3>
          <p>{{ $t('support_page.sent_desc') }}</p>
          <button class="btn btn-secondary btn-sm" @click="sent = false; resetForm()">
            {{ $t('support_page.new_message') }}
          </button>
        </div>

        <form v-else @submit.prevent="handleSubmit" novalidate>
          <h2>{{ $t('support.title') }}</h2>
          <div class="form-group">
            <label class="form-label">{{ $t('support.name') }} *</label>
            <input v-model="form.name" type="text" class="form-input" :class="{ error: errors.name }"
              required @blur="errors.name = !form.name ? t('validation.required') : ''"/>
            <p v-if="errors.name" class="form-error" role="alert">{{ errors.name }}</p>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('support.email') }} *</label>
            <input v-model="form.email" type="email" class="form-input" :class="{ error: errors.email }"
              required @blur="validateEmail"/>
            <p v-if="errors.email" class="form-error" role="alert">{{ errors.email }}</p>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('support.message') }} *</label>
            <textarea v-model="form.message" class="form-textarea" rows="5"
              :placeholder="$t('support.placeholder')"
              required @blur="errors.message = !form.message ? t('validation.required') : ''"></textarea>
            <p v-if="errors.message" class="form-error" role="alert">{{ errors.message }}</p>
          </div>
          <button type="submit" class="btn btn-primary btn-full" :disabled="submitting">
            <svg v-if="submitting" class="animate-spin" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            {{ submitting ? $t('common.loading') : $t('support.submit') }}
          </button>
        </form>
      </div>

      <!-- Infos contact -->
      <div class="contact-info">
        <div class="contact-card card">
          <div class="contact-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h4>Chat / Email</h4>
          <p>{{ $t('support_page.contact_response') }}</p>
          <a href="mailto:support@findme.cm">support@findme.cm</a>
        </div>
        <div class="contact-card card">
          <div class="contact-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C6B3A" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <h4>{{ $t('support_page.contact_hours_label') }}</h4>
          <p>{{ $t('support_page.contact_hours') }}</p>
          <a href="tel:+237699000000">+237 699 000 000</a>
        </div>
        <div class="contact-card card">
          <div class="contact-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#854F0B" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h4>{{ $t('support_page.contact_title') }}</h4>
          <p>Rue Alfred Saker, Akwa</p>
          <span>Douala, Cameroun</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta, useRuntimeConfig } from '#imports'
import { useToast } from '../composables/useToast'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })
useSeoMeta({ title: 'Support — findMe' })

const { t } = useI18n()
const config = useRuntimeConfig()
const { showToast } = useToast()

const submitting = ref(false)
const sent = ref(false)
const form = reactive({ name: '', email: '', message: '' })
const errors = reactive({ name: '', email: '', message: '' })

const validateEmail = () => {
  if (!form.email) errors.email = t('validation.required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = t('validation.email_invalid')
  else errors.email = ''
}

const resetForm = () => { form.name = ''; form.email = ''; form.message = '' }

const handleSubmit = async () => {
  errors.name = !form.name ? t('validation.required') : ''
  validateEmail()
  errors.message = !form.message ? t('validation.required') : ''
  if (Object.values(errors).some(e => e)) return

  submitting.value = true
  try {
    // POST /support → { success, message, data: { ticketId } }
    await $fetch(`${config.public.apiBase}/support`, {
      method: 'POST',
      body: { name: form.name, email: form.email, message: form.message },
    })
    sent.value = true
    showToast(t('support.success'), 'success')
  } catch {
    showToast(t('errors.network'), 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.support-page { padding: 32px; max-width: 900px; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 26px; margin-bottom: 6px; }
.page-sub { color: var(--color-text-secondary); font-size: 15px; }
.support-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
.support-form-card { padding: 28px; }
.support-form-card h2 { font-size: 20px; margin-bottom: 24px; }
.success-state { text-align: center; padding: 24px 0; }
.success-icon { width: 56px; height: 56px; border-radius: 50%; background: #ECFDF5; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.success-state h3 { font-size: 20px; margin-bottom: 8px; }
.success-state p { color: var(--color-text-secondary); margin-bottom: 20px; }
.contact-info { display: flex; flex-direction: column; gap: 16px; }
.contact-card { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
.contact-icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--color-bg-secondary); display: flex; align-items: center; justify-content: center; }
.contact-card h4 { font-size: 15px; font-weight: 600; }
.contact-card p, .contact-card span { font-size: 13px; color: var(--color-text-secondary); }
.contact-card a { font-size: 13px; color: var(--color-primary); text-decoration: none; font-weight: 500; }
@media (max-width: 768px) {
  .support-page { padding: 16px; }
  .support-grid { grid-template-columns: 1fr; }
}
</style>