document.addEventListener('DOMContentLoaded', () => {
    initModal();
    initEditForm();
    initDeleteButtons();
});

function initModal() {
    const modal = document.getElementById('editModal');
    if (!modal) return;

    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => closeModal(modal));
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal--open')) {
            closeModal(modal);
        }
    });
}

function openModal(ad) {
    const modal = document.getElementById('editModal');
    document.getElementById('editId').value = ad.id;
    document.getElementById('editTitle').value = ad.title;
    document.getElementById('editDescription').value = ad.description;
    document.getElementById('editPrice').value = ad.price;
    document.getElementById('editCategory').value = ad.category;
    document.getElementById('editStatus').value = ad.status;
    document.getElementById('editErrors').innerHTML = '';
    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('modal--open');
    document.body.style.overflow = '';
}

function initEditForm() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            try {
                const res = await fetch(`/ads/${id}`);
                const ad = await res.json();
                openModal(ad);
            } catch (err) {
                alert('Ошибка загрузки объявления');
            }
        });
    });

    const form = document.getElementById('editForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const data = {
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDescription').value,
                price: parseFloat(document.getElementById('editPrice').value),
                category: document.getElementById('editCategory').value,
                status: document.getElementById('editStatus').value
            };

            try {
                const res = await fetch(`/ads/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                if (!res.ok) {
                    const errorsEl = document.getElementById('editErrors');
                    errorsEl.innerHTML = result.errors.map(e => `<p>${e}</p>`).join('');
                    return;
                }

                location.reload();
            } catch (err) {
                alert('Ошибка сохранения');
            }
        });
    }
}

function initDeleteButtons() {
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Удалить объявление? Это действие нельзя отменить.')) return;

            const id = btn.dataset.id;
            try {
                const res = await fetch(`/ads/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    location.reload();
                } else {
                    alert('Ошибка удаления');
                }
            } catch (err) {
                alert('Ошибка сети');
            }
        });
    });
}