// booking.js — handles the table reservation form.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  const msg = document.getElementById('booking-msg');
  if (!form) return;

  // Prevent picking a date in the past.
  const dateInput = form.querySelector('#booking_date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'form-msg';
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const payload = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      party_size: Number(form.party_size.value),
      booking_date: form.booking_date.value,
      booking_time: form.booking_time.value,
      special_request: form.special_request.value,
    };

    try {
      const data = await api.post('/api/bookings', payload);
      msg.textContent = data.message;
      msg.classList.add('show', 'ok');
      form.reset();
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add('show', 'err');
    } finally {
      submitBtn.disabled = false;
    }
  });
});
