/**
 * [
 *    {
 *      id: <string> | <number>
 *      title: <string>
 *      author: <string>
 *      year: <number>
 *      isComplete: <boolean>
 *    }
 * ]
 */

const books = [];
const RENDER_EVENT = 'renderBook';
const SAVED_EVENT = 'savedBook';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id, 
        title, 
        author, 
        year, 
        isComplete
    };
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
    const {id, title, author, year, isComplete} = bookObject;

    const textTitle = document.createElement('h3');
    textTitle.innerText = `${title}`;

    const textAuthor = document.createElement('h4');
    textAuthor.innerText = `Penulis : ${author}`;

    const textYear = document.createElement('h4');
    textYear.innerText = `Tahun Terbit : ${year}`;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);
    
    const container = document.createElement('div');
    container.classList.add('containerBooks')
    container.append(textContainer);
    container.setAttribute('id', `book-${id}`);

    if (isComplete) {
        const incompleteButton = document.createElement('button');
        incompleteButton.innerHTML = '<p><i class="bi bi-book-fill"></i> Belum Selesai dibaca</p>'
        incompleteButton.classList.add('incomplete');
        incompleteButton.addEventListener('click', function() {
            undoBookFromCompleted(id);
            if (undoBookFromCompleted !== false) {
                swal("Buku " + title + " telah berhasil dipindahkan!", {
                    icon: "success",
                });
            } else {
                swal("Ups! Gagal memindahkan buku!", {
                    icon: "error",
                    text: "Sepertinya ada masalah teknis, buku tidak dapat dipindahkan saat ini. Silakan coba lagi nanti.",
                });
            }
        });

        const removeButton = document.createElement('button');
        removeButton.innerHTML = '<p><i class="bi bi-trash-fill"></i> Hapus Buku</p>'
        removeButton.classList.add('remove');
        removeButton.addEventListener('click', function() {
            swal({
                title: "Apakah Anda yakin ingin menghapus buku " + title + "?",
                icon: "warning",
                buttons: ["Batal", "Ya, Hapus"],
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    swal({
                        title: "Buku Berhasil Dihapus!",
                        icon: "success",
                        text: "Buku " + title + " telah dihapus dari koleksi Anda."
                    });
                    removeBookFromCompleted(id);
                } else {
                    swal({
                        title: "Buku Tetap Aman!", 
                        icon: "error",
                        text: "Buku " + title + " tidak dihapus dari koleksi Anda."
                    });
                }
            });
        });
        container.append(incompleteButton, removeButton);
    } else {
        const completeButton = document.createElement('button');
        completeButton.innerHTML = '<p><i class="bi bi-journal-check"></i> Selesai Dibaca</p>'
        completeButton.classList.add('complete');
        completeButton.addEventListener('click', function() {
            addBookToCompleted(id);
            if (addBookToCompleted !== false) {
                swal("Hebat! Kamu telah menyelesaikan buku " + title + "!", {
                    icon: "success",
                });
            } else {
                swal("Gagal memindahkan buku!", {
                    icon: "error",
                });
            }
        });

        const removeButton = document.createElement('button');
        removeButton.innerHTML = '<p><i class="bi bi-trash-fill"></i> Hapus Buku</p>'
        removeButton.classList.add('remove');
        removeButton.addEventListener('click', function() {
            swal({
                title: "Apakah Anda yakin ingin menghapus buku " + title + "?",
                icon: "warning",
                buttons: ["Batal", "Ya, Hapus"],
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    swal({
                        title: "Buku Berhasil Dihapus!",
                        icon: "success",
                        text: "Buku " + title + " telah dihapus dari koleksi Anda."
                    });
                    removeBookFromCompleted(id);
                } else {
                    swal({
                        title: "Buku Tetap Aman!", 
                        icon: "error",
                        text: "Buku " + title + " tidak dihapus dari koleksi Anda."
                    });
                }
            });
        });
        container.append(completeButton, removeButton);
    }
    return container;
}

function resetForm() {
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookIsComplete').checked = false;
    return;
}

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = parseInt(document.getElementById('inputBookYear').value);
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const id = generateId();
    const bookObject = generateBookObject(id, title, author, year, isComplete, false);

    resetForm();
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function searchBook() {
    let search = document.querySelector('#searchBookTitle').value;
    let returnSearch = document.getElementsByClassName('containerBooks');

    for (const bookItem of returnSearch) {
        let titleBook = bookItem.innerText.toUpperCase();
        let searchBook = titleBook.search(search.toUpperCase());
        if (searchBook != -1) {
            bookItem.style.display = '';
        } else {
            bookItem.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputBook');
    const searchForm = document.getElementById('searchBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        swal("Buku Telah Ditambahkan!", {
            icon: "success",
            text: "Buku berhasil ditambahkan ke dalam koleksimu. Selamat membaca!"
        });
    });
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        searchBook();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, () => {
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function() {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const listCompleted = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    listCompleted.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            listCompleted.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
});