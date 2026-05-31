function initSharePage() {
    const modal = document.getElementById('modal');

    document
    .getElementById('openModal')
    .addEventListener('click', () => {
        modal.classList.add('show');
    });

    document
    .getElementById('closeModal')
    .addEventListener('click', () => {
        modal.classList.remove('show');
    });

    document
    .getElementById('saveBtn')
    .addEventListener('click', () => {

        updateSummary();

        modal.classList.remove('show');
    });

    modal.addEventListener('click', (e) => {

        if (e.target === modal) {
            modal.classList.remove('show');
        }

    });

    function updateSummary(){

        const selected = [];

        document
        .querySelectorAll('.recipient:checked')
        .forEach(item => {
            selected.push(item.value);
        });

        const summary =
            document.getElementById('selectedSummary');

        if(selected.length === 0){
            summary.textContent =
                'Pilih penerima';
        }
        else if(selected.length <= 3){
            summary.textContent =
                selected.join(', ');
        }
        else{
            summary.textContent =
                selected.slice(0,3).join(', ')
                + ' +' +
                (selected.length - 3)
                + ' lainnya';
        }
    }
}