/* ==========================================================
   LEARN CAD WITH CIVIL ENGINEER - MASTER JAVASCRIPT
   ========================================================== */

// 1. Smooth Scroll for Navigation Links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e){
        const href = this.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if(target){
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// 2. Welcome Console Greeting
window.onload = function(){
    console.log("Welcome to Learn CAD with Er. Arun Banjare - Secure LMS & Portal Active");
};

// 3. Button Hover Animation
const buttons = document.querySelectorAll(".btn, .btn2, .auth-btn, .reg-submit");
buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
        btn.style.transform = "scale(1.03)";
        btn.style.transition = "transform 0.2s ease";
    });
    btn.addEventListener("mouseleave", () => {
        btn.style.transform = "scale(1)";
    });
});

// 4. Input Sanitization Utility
function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"'`=\/]/g, function (s) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'}[s];
    }).replace(/[;|&$`]/g, '').trim();
}

// 5. Global State Variables
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
let slideInterval = setInterval(nextSlide, 4000);
let currentStudentUser = null;
let globalCoursesData = {};
let globalCouponsData = {};
let currentStudentTabActive = 'my';

const RAZORPAY_KEY_ID = "rzp_live_TJZTFyvVjOndr5";

// 6. Image Slider Controls
function showSlide(index) {
    if (slides.length > 0) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }
}

function changeSlide(direction) {
    clearInterval(slideInterval);
    showSlide(currentSlide + direction);
    slideInterval = setInterval(nextSlide, 4000);
}

function nextSlide() {
    if (slides.length > 0) showSlide(currentSlide + 1);
}

// 7. Form Toggles & Authentication Modals
function toggleForm(formType) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (formType === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    } else {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
    const authSec = document.getElementById('auth');
    if(authSec) authSec.scrollIntoView();
}

function handleForgotPassword() {
    const email = prompt("Enter your registered Email Address:");
    if (!email || email.trim() === "") return;
    if (window.sendPasswordResetEmail && window.firebaseAuth) {
        window.sendPasswordResetEmail(window.firebaseAuth, email.trim().toLowerCase())
            .then(() => alert("Password Reset Link sent to " + email + "!"))
            .catch((error) => alert("Error: " + error.message));
    }
}

// 8. Authentication State Listener & Initialization
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initDynamicSystem();
        if (window.onAuthStateChanged && window.firebaseAuth) {
            window.onAuthStateChanged(window.firebaseAuth, (user) => {
                if (user) {
                    if (user.email.toLowerCase() === "er.arunbanjare@gmail.com" || user.email.toLowerCase() === "admin@learncad.com") {
                        showAdminPanel();
                    } else {
                        document.getElementById('admin-panel').classList.add('hidden');
                        document.getElementById('main-website').classList.add('hidden');
                        document.getElementById('auth').classList.add('hidden');
                        
                        const dbRef = window.firebaseRef(window.firebaseDB);
                        window.firebaseGet(window.firebaseChild(dbRef, 'users/' + user.uid)).then(snapshot => {
                            if (snapshot.exists()) {
                                currentStudentUser = snapshot.val();
                                currentStudentUser.id = user.uid;
                            } else {
                                currentStudentUser = { username: user.email.split('@')[0], id: user.uid, email: user.email };
                            }
                            document.getElementById('student-dashboard').classList.remove('hidden');
                            document.getElementById('welcome-user').innerText = "Welcome, " + currentStudentUser.username + "!";
                            loadStudentDashboardData();
                            document.getElementById('studentChatWidgetContainer').style.display = 'block';
                            initStudentLiveChat();
                            
                            const chatForm = document.getElementById('student-chat-form');
                            if (chatForm) {
                                chatForm.onsubmit = sendStudentChatMessage;
                            }
                        });
                    }
                } else {
                    document.getElementById('admin-panel').classList.add('hidden');
                    document.getElementById('student-dashboard').classList.add('hidden');
                    document.getElementById('main-website').classList.remove('hidden');
                    document.getElementById('auth').classList.remove('hidden');
                    document.getElementById('studentChatWidgetContainer').style.display = 'none';
                }
            });
        }
    }, 1000);
});

// 9. Database Sync & Course Loading
function initDynamicSystem() {
    if (window.firebaseDB && window.firebaseGet && window.firebaseChild && window.firebaseRef) {
        const dbRef = window.firebaseRef(window.firebaseDB);
        window.firebaseGet(window.firebaseChild(dbRef, 'courses')).then(snapshot => {
            if (!snapshot.exists()) {
                const defaultCourses = {
                    "c1": { title: "AutoCAD 2D Course", price: 1000, category: "CAD Training", desc: "Basic to Advanced Practical Drawings & PDF Notes", thumb: "logo3.png" },
                    "c2": { title: "AutoCAD 2D + 3D Course", price: 1500, category: "CAD Training", desc: "Complete 2D + 3D Real House Plan Practice", thumb: "logo4.png" },
                    "c3": { title: "Revit Architecture", price: 1500, category: "CAD Training", desc: "Complete 3D Modeling, Vastu Layouts & Rendering", thumb: "logo5.png" },
                    "c4": { title: "Polytechnic 2nd Sem Civil Notes", price: 0, category: "Polytechnic Notes", desc: "Handcrafted PDF Notes for Applied Mechanics & Construction", thumb: "blueprint.png.png" }
                };
                window.firebaseSet(window.firebaseRef(window.firebaseDB, 'courses'), defaultCourses).then(() => loadMainCourses());
            } else {
                loadMainCourses();
            }
        });
        loadCouponsData();
    }
}

function loadCouponsData() {
    const dbRef = window.firebaseRef(window.firebaseDB);
    window.firebaseGet(window.firebaseChild(dbRef, 'coupons')).then(snapshot => {
        if (snapshot.exists()) {
            globalCouponsData = snapshot.val();
        }
    });
}

function loadMainCourses() {
    const dbRef = window.firebaseRef(window.firebaseDB);
    window.firebaseGet(window.firebaseChild(dbRef, 'courses')).then(snapshot => {
        if (snapshot.exists()) {
            globalCoursesData = snapshot.val();
            let cardsHtml = "";
            let regDropdownHtml = `<option value="">Select Course / Notes *</option>`;
            let admDropdownHtml = `<option value="">Select Target Course *</option>`;

            Object.keys(globalCoursesData).forEach(id => {
                const c = globalCoursesData[id];
                const priceText = c.price == 0 ? "₹0 (FREE)" : "₹" + c.price;
                cardsHtml += `<div class="course-card floating-element">
                    <h3>${c.title}</h3>
                    <div class="price">${priceText}</div>
                    <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">${c.desc || ''}</p>
                    <a href="#registration" class="btn">Enroll Now</a>
                </div>`;
                regDropdownHtml += `<option value="${c.title} (${priceText})">${c.title} - ${priceText}</option>`;
                admDropdownHtml += `<option value="${id}">${c.title}</option>`;
            });

            const mainList = document.getElementById('main-courses-list');
            const regCourse = document.getElementById('reg-course');
            const admMCourse = document.getElementById('adm-m-course');
            
            if (mainList) mainList.innerHTML = cardsHtml;
            if (regCourse) regCourse.innerHTML = regDropdownHtml;
            if (admMCourse) admMCourse.innerHTML = admDropdownHtml;
        }
    });
}

// 10. Admin Navigation & Table Filters
function switchAdminTab(tabName) {
    ['payments', 'courses', 'house', 'users', 'coupons', 'support'].forEach(t => {
        const tabEl = document.getElementById('atab-' + t);
        const secEl = document.getElementById('asec-' + t);
        if (tabEl) tabEl.classList.remove('active');
        if (secEl) secEl.classList.add('hidden');
    });

    const activeTab = document.getElementById('atab-' + tabName);
    const activeSec = document.getElementById('asec-' + tabName);
    if (activeTab) activeTab.classList.add('active');
    if (activeSec) activeSec.classList.remove('hidden');

    if (tabName === 'support') loadAdminSupportChats();
    if (tabName === 'coupons') loadAdminCoupons();
}

function filterAdminTable(inputId, containerId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const query = input.value.toLowerCase();
    const container = document.getElementById(containerId);
    if (!container) return;
    const rows = container.querySelectorAll('tbody tr, table tr');
    rows.forEach((row, index) => {
        if (index === 0) return;
        row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
    });
}

// 11. Admin Course, Coupon & Material Management
function handleCreateCourse(e) {
    e.preventDefault();
    const title = sanitizeInput(document.getElementById('adm-c-title').value);
    const price = parseInt(document.getElementById('adm-c-price').value.trim());
    const category = document.getElementById('adm-c-category').value;
    const thumb = sanitizeInput(document.getElementById('adm-c-thumb').value.trim());
    const desc = sanitizeInput(document.getElementById('adm-c-desc').value);

    window.firebasePush(window.firebaseRef(window.firebaseDB, 'courses'), {
        title, price, category, thumb, desc, createdAt: new Date().toISOString()
    }).then(() => {
        alert("Course created successfully!");
        loadMainCourses();
        loadAdminData();
        e.target.reset();
    });
}

function handleCreateCoupon(e) {
    e.preventDefault();
    const code = sanitizeInput(document.getElementById('adm-cp-code').value).toUpperCase();
    const discount = parseInt(document.getElementById('adm-cp-disc').value);

    window.firebasePush(window.firebaseRef(window.firebaseDB, 'coupons'), {
        code, discount, createdAt: new Date().toISOString()
    }).then(() => {
        alert("Coupon created successfully!");
        loadCouponsData();
        loadAdminCoupons();
        e.target.reset();
    });
}

function deleteCoupon(cpId, cpCode) {
    if (confirm(`Delete coupon "${cpCode}"?`)) {
        window.firebaseRemove(window.firebaseRef(window.firebaseDB, 'coupons/' + cpId)).then(() => {
            loadCouponsData();
            loadAdminCoupons();
        });
    }
}

function loadAdminCoupons() {
    window.firebaseGet(window.firebaseChild(window.firebaseRef(window.firebaseDB), 'coupons')).then(snapshot => {
        const couponsList = document.getElementById('admin-coupons-list');
        if (!couponsList) return;
        if (snapshot.exists()) {
            const coupons = snapshot.val();
            let html = `<table class="admin-table"><tr><th>Coupon Code</th><th>Discount Amount</th><th>Action</th></tr>`;
            Object.keys(coupons).forEach(cpId => {
                const cp = coupons[cpId];
                html += `<tr><td><b>${cp.code}</b></td><td><span style="color:#28a745; font-weight:bold;">₹${cp.discount}</span></td><td><button class="btn-del" onclick="deleteCoupon('${cpId}', '${cp.code}')">🗑️ Delete</button></td></tr>`;
            });
            html += `</table>`;
            couponsList.innerHTML = html;
        } else {
            couponsList.innerHTML = `<p style="color:#888;">No active coupons found.</p>`;
        }
    });
}

function deleteCourse(courseId, courseTitle) {
    if (confirm(`Delete "${courseTitle}"?`)) {
        window.firebaseRemove(window.firebaseRef(window.firebaseDB, 'courses/' + courseId)).then(() => {
            window.firebaseRemove(window.firebaseRef(window.firebaseDB, 'course_materials/' + courseId));
            loadMainCourses();
            loadAdminData();
        });
    }
}

function deleteMaterial(courseId, materialId, materialTitle) {
    if (confirm(`Delete material "${materialTitle}"?`)) {
        window.firebaseRemove(window.firebaseRef(window.firebaseDB, 'course_materials/' + courseId + '/' + materialId)).then(() => {
            openCourseMaterials(courseId, "Course Materials");
        });
    }
}

function editMaterial(courseId, materialId, subject, unit, title, type, link) {
    document.getElementById('adm-m-course').value = courseId;
    document.getElementById('adm-m-subject').value = subject;
    document.getElementById('adm-m-unit').value = unit;
    document.getElementById('adm-m-title').value = title;
    document.getElementById('adm-m-type').value = type;
    document.getElementById('adm-m-link').value = link;
    document.getElementById('adm-edit-material-id').value = materialId;
    document.getElementById('adm-upload-btn').innerText = "Update / Replace Material";
    alert("Material loaded into form. Modify details and click 'Update / Replace Material'.");
}

function handleUploadMaterial(e) {
    e.preventDefault();
    const courseId = document.getElementById('adm-m-course').value;
    const subject = sanitizeInput(document.getElementById('adm-m-subject').value);
    const unit = sanitizeInput(document.getElementById('adm-m-unit').value);
    const title = sanitizeInput(document.getElementById('adm-m-title').value);
    const type = document.getElementById('adm-m-type').value;
    const link = document.getElementById('adm-m-link').value.trim();
    const editId = document.getElementById('adm-edit-material-id').value;

    const materialData = { subject, unit, title, type, link, updatedAt: new Date().toISOString() };

    if (editId) {
        window.firebaseSet(window.firebaseRef(window.firebaseDB, 'course_materials/' + courseId + '/' + editId), materialData).then(() => {
            alert("Material Replaced / Updated Successfully!");
            document.getElementById('adm-edit-material-id').value = "";
            document.getElementById('adm-upload-btn').innerText = "Publish Material";
            e.target.reset();
        });
    } else {
        window.firebasePush(window.firebaseRef(window.firebaseDB, 'course_materials/' + courseId), {
            ...materialData, createdAt: new Date().toISOString()
        }).then(() => {
            alert("Material Published Successfully!");
            e.target.reset();
        });
    }
}

// 12. House Plan Inquiries & Admin Dashboard Data
function handleHouseInquiry(event) {
    event.preventDefault();
    const name = sanitizeInput(document.getElementById('hp-name').value);
    const mobile = sanitizeInput(document.getElementById('hp-mobile').value);
    const size = sanitizeInput(document.getElementById('hp-size').value);
    const nagarpalika = sanitizeInput(document.getElementById('hp-nagarpalika').value);
    const district = sanitizeInput(document.getElementById('hp-district').value);
    const state = sanitizeInput(document.getElementById('hp-state').value);
    const details = sanitizeInput(document.getElementById('hp-details').value);
    
    const btn = document.getElementById('hp-submit-btn');
    if(btn) {
        btn.innerText = "Submitting...";
        btn.disabled = true;
    }

    window.firebasePush(window.firebaseRef(window.firebaseDB, 'house_plan_requests'), {
        name, mobile, plot_size: size, nagar_palika: nagarpalika, district, state, details, submittedAt: new Date().toLocaleString()
    }).then(() => {
        alert("House Plan inquiry submitted successfully!");
        document.getElementById('house-inquiry-form').reset();
    }).finally(() => {
        if(btn) {
            btn.innerText = "Submit Request";
            btn.disabled = false;
        }
    });
}

function openAdminModal() {
    const adminEmail = prompt("Enter Admin Email:");
    if (!adminEmail) return;
    const adminPass = prompt("Enter Admin Secret Password:");
    if (!adminPass) return;

    window.signInWithEmailAndPassword(window.firebaseAuth, adminEmail, adminPass).then(() => {
        showAdminPanel();
    }).catch((error) => alert("Error: " + error.message));
}

function showAdminPanel() {
    document.getElementById('main-website').classList.add('hidden');
    document.getElementById('auth').classList.add('hidden');
    document.getElementById('student-dashboard').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    document.getElementById('studentChatWidgetContainer').style.display = 'none';
    window.scrollTo(0,0);
    loadAdminData();
}

function closeAdminPanel() {
    window.signOutUser(window.firebaseAuth).then(() => {
        localStorage.clear();
        sessionStorage.clear();
        document.getElementById('admin-panel').classList.add('hidden');
        document.getElementById('student-dashboard').classList.add('hidden');
        document.getElementById('main-website').classList.remove('hidden');
        document.getElementById('auth').classList.remove('hidden');
        document.getElementById('studentChatWidgetContainer').style.display = 'none';
        window.scrollTo(0,0);
    });
}

function loadAdminData() {
    if (window.firebaseDB && window.firebaseGet && window.firebaseChild && window.firebaseRef) {
        const dbRef = window.firebaseRef(window.firebaseDB);
        
        window.firebaseGet(window.firebaseChild(dbRef, 'payments/razorpay')).then(snapshot => {
            const countEl = document.getElementById('stat-approved-count');
            const listEl = document.getElementById('admin-approved-list');
            if (snapshot.exists()) {
                const appData = snapshot.val();
                const aKeys = Object.keys(appData);
                if(countEl) countEl.innerText = aKeys.length;

                let html = `<table class="admin-table"><tr><th>Student Name</th><th>Course</th><th>Amount</th><th>Razorpay Payment ID</th><th>Date</th></tr>`;
                aKeys.forEach(aId => {
                    const a = appData[aId];
                    html += `<tr><td><b>${a.userName || 'Student'}</b></td><td>${a.courseTitle}</td><td><span style="color:#28a745; font-weight:bold;">₹${a.amount}</span></td><td><code>${a.payment_id}</code></td><td><small>${a.paidAt ? new Date(a.paidAt).toLocaleDateString() : ''}</small></td></tr>`;
                });
                html += `</table>`;
                if(listEl) listEl.innerHTML = html;
            } else {
                if(countEl) countEl.innerText = '0';
                if(listEl) listEl.innerHTML = `<p style="color:#888;">No payments found.</p>`;
            }
        });

        window.firebaseGet(window.firebaseChild(dbRef, 'courses')).then(snapshot => {
            const countEl = document.getElementById('stat-course-count');
            const listEl = document.getElementById('admin-manage-courses-list');
            if (snapshot.exists()) {
                const courses = snapshot.val();
                const courseKeys = Object.keys(courses);
                if(countEl) countEl.innerText = courseKeys.length;

                let html = `<table class="admin-table"><tr><th>Title</th><th>Price</th><th>Category</th><th>Action</th></tr>`;
                courseKeys.forEach(cId => {
                    const c = courses[cId];
                    html += `<tr><td><b>${c.title}</b></td><td>₹${c.price}</td><td>${c.category || ''}</td><td><button class="btn-del" onclick="deleteCourse('${cId}', '${c.title.replace(/'/g, "\\'")}')">🗑️ Delete</button></td></tr>`;
                });
                html += `</table>`;
                if(listEl) listEl.innerHTML = html;
            }
        });

        window.firebaseGet(window.firebaseChild(dbRef, 'house_plan_requests')).then(snapshot => {
            const countEl = document.getElementById('stat-house-count');
            const listEl = document.getElementById('admin-house-list');
            if (snapshot.exists()) {
                const data = snapshot.val();
                const keys = Object.keys(data);
                if(countEl) countEl.innerText = keys.length;

                let html = `<table class="admin-table"><tr><th>Client Name</th><th>Mobile</th><th>Plot Size</th><th>City</th><th>Action</th></tr>`;
                keys.forEach(key => {
                    const h = data[key];
                    html += `<tr><td><b>${h.name}</b></td><td>${h.mobile}</td><td>${h.plot_size}</td><td>${h.nagar_palika}</td><td><a class="admin-btn-wa" href="https://wa.me/91${h.mobile}" target="_blank">Chat</a></td></tr>`;
                });
                html += `</table>`;
                if(listEl) listEl.innerHTML = html;
            }
        });

        window.firebaseGet(window.firebaseChild(dbRef, 'users')).then(userSnapshot => {
            window.firebaseGet(window.firebaseChild(dbRef, 'registrations')).then(regSnapshot => {
                const listEl = document.getElementById('admin-user-list');
                let html = `<table class="admin-table"><tr><th>Name</th><th>Email / Course</th><th>Mobile</th><th>Source</th></tr>`;
                let hasData = false;

                if (userSnapshot.exists()) {
                    hasData = true;
                    const usersData = userSnapshot.val();
                    Object.keys(usersData).forEach(key => {
                        const u = usersData[key];
                        html += `<tr><td><b>${u.username || 'N/A'}</b></td><td>${u.email || 'N/A'}</td><td>${u.mobile || 'N/A'}</td><td><span style="color:blue;">Portal Account</span></td></tr>`;
                    });
                }

                if (regSnapshot.exists()) {
                    hasData = true;
                    const regData = regSnapshot.val();
                    Object.keys(regData).forEach(key => {
                        const r = regData[key];
                        html += `<tr><td><b>${r.name || 'N/A'}</b></td><td>${r.email || 'N/A'} <br><small style="color:green;">(${r.course || ''})</small></td><td>${r.phone || 'N/A'}</td><td><span style="color:green;">Course Reg Form</span></td></tr>`;
                    });
                }

                if (hasData) {
                    html += `</table>`;
                    if(listEl) listEl.innerHTML = html;
                } else {
                    if(listEl) listEl.innerHTML = `<p style="color:#888;">No registered users found.</p>`;
                }
            });
        });
    }
}

// 13. Student Support Live Chat System
function toggleStudentChatBox() {
    const box = document.getElementById('studentChatPopupBox');
    if(box) box.classList.toggle('hidden');
}

function initStudentLiveChat() {
    if (!currentStudentUser || !currentStudentUser.id) return;
    const chatRef = window.firebaseRef(window.firebaseDB, 'supports/' + currentStudentUser.id);
    window.firebaseOnValue(chatRef, (snapshot) => {
        const messagesArea = document.getElementById('student-chat-messages');
        if (!messagesArea) return;
        if (!snapshot.exists()) {
            messagesArea.innerHTML = `<div style="text-align: center; color: #888; font-size: 0.85rem; margin-top: auto; margin-bottom: auto;">Apni samasya yahan message ke roop mein bhejein. Admin turant reply karenge!</div>`;
            return;
        }
        const msgs = snapshot.val();
        let html = "";
        Object.keys(msgs).forEach(mKey => {
            const m = msgs[mKey];
            const msgClass = m.sender === 'admin' ? 'admin' : 'student';
            html += `<div class="chat-msg ${msgClass}">
                <div style="font-size: 10px; opacity: 0.8; margin-bottom: 2px;"><b>${m.senderName}</b></div>
                <div>${m.text}</div>
            </div>`;
        });
        messagesArea.innerHTML = html;
        messagesArea.scrollTop = messagesArea.scrollHeight;
    });
}

function sendStudentChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('student-msg-input');
    if (!input) return;
    const text = sanitizeInput(input.value);
    if (!text || !currentStudentUser) return;

    window.firebasePush(window.firebaseRef(window.firebaseDB, 'supports/' + currentStudentUser.id), {
        sender: 'student',
        senderName: currentStudentUser.username || 'Student',
        text: text,
        timestamp: new Date().toISOString()
    }).then(() => {
        input.value = "";
    }).catch((err) => {
        alert("Message send nahi ho paya: " + err.message);
    });
}

function loadAdminSupportChats() {
    const dbRef = window.firebaseRef(window.firebaseDB);
    window.firebaseGet(window.firebaseChild(dbRef, 'users')).then(userSnap => {
        window.firebaseGet(window.firebaseChild(dbRef, 'supports')).then(supportSnap => {
            const chatListDiv = document.getElementById('admin-chat-students-list');
            if (!chatListDiv) return;
            if (!supportSnap.exists()) {
                chatListDiv.innerHTML = `<p style="color:#888; font-size:0.9rem;">Koi student chat available nahi hai.</p>`;
                return;
            }
            const supports = supportSnap.val();
            const users = userSnap.exists() ? userSnap.val() : {};
            let listHtml = "";

            Object.keys(supports).forEach(sUid => {
                const sInfo = users[sUid] || { username: 'Student (' + sUid.substring(0,6) + ')' };
                listHtml += `<div onclick="openAdminChatForStudent('${sUid}', '${sInfo.username.replace(/'/g, "\\'")}')" style="padding: 12px; border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: 0.2s; border-radius: 6px; margin-bottom: 5px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                    <div style="font-weight: 600; color: #1e293b; font-size: 0.95rem;">👤 ${sInfo.username}</div>
                    <div style="font-size: 12px; color: #64748b;">Click to view chat →</div>
                </div>`;
            });
            chatListDiv.innerHTML = listHtml;
        });
    });
}

function openAdminChatForStudent(studentUid, studentName) {
    const container = document.getElementById('admin-active-chat-box');
    if (!container) return;
    container.innerHTML = `<div style="font-weight: 600; color: #0056b3; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0;">Chat with: ${studentName}</div>
        <div class="chat-messages-area" id="admin-chat-msgs-area" style="height: 350px; overflow-y: auto; background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;"></div>
        <form class="chat-input-row" onsubmit="sendAdminChatMessage(event, '${studentUid}', '${studentName}')" style="display: flex; gap: 10px;">
            <input type="text" id="admin-msg-input" placeholder="Admin reply yahan type karein..." required autocomplete="off" style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
            <button type="submit" style="padding: 0 20px; background: #28a745; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Reply</button>
        </form>`;

    const chatRef = window.firebaseRef(window.firebaseDB, 'supports/' + studentUid);
    window.firebaseOnValue(chatRef, (snapshot) => {
        const area = document.getElementById('admin-chat-msgs-area');
        if (!area) return;
        if (!snapshot.exists()) {
            area.innerHTML = `<p style="color:#888; text-align:center;">No messages yet.</p>`;
            return;
        }
        const msgs = snapshot.val();
        let html = "";
        Object.keys(msgs).forEach(mKey => {
            const m = msgs[mKey];
            const msgClass = m.sender === 'admin' ? 'student' : 'admin';
            html += `<div class="chat-msg ${msgClass}">
                <div style="font-size: 10px; opacity: 0.8; margin-bottom: 2px;"><b>${m.senderName}</b></div>
                <div>${m.text}</div>
            </div>`;
        });
        area.innerHTML = html;
        area.scrollTop = area.scrollHeight;
    });
}

function sendAdminChatMessage(e, studentUid, studentName) {
    e.preventDefault();
    const input = document.getElementById('admin-msg-input');
    if (!input) return;
    const text = sanitizeInput(input.value);
    if (!text) return;

    window.firebasePush(window.firebaseRef(window.firebaseDB, 'supports/' + studentUid), {
        sender: 'admin',
        senderName: 'Er. Arun Banjare (Admin)',
        text: text,
        timestamp: new Date().toISOString()
    }).then(() => {
        input.value = "";
    });
}

// 14. Signup, Login, Logout & Registration Management
function submitSignup(event) {
    event.preventDefault();
    const name = sanitizeInput(document.getElementById('signup-name').value);
    const email = sanitizeInput(document.getElementById('signup-email').value).toLowerCase();
    const mobile = sanitizeInput(document.getElementById('signup-mobile').value);
    const pass = document.getElementById('signup-pass').value.trim();

    window.createUserWithEmailAndPassword(window.firebaseAuth, email, pass).then((userCredential) => {
        window.firebaseSet(window.firebaseRef(window.firebaseDB, 'users/' + userCredential.user.uid), {
            username: name, email, mobile, createdAt: new Date().toISOString()
        }).then(() => {
            alert("Account created successfully!");
            event.target.reset();
            toggleForm('login');
        });
    }).catch((error) => alert("Error: " + error.message));
}

function handleLogin(event) {
    event.preventDefault();
    const email = sanitizeInput(document.getElementById('login-id').value).toLowerCase();
    const pass = document.getElementById('login-pass').value.trim();

    window.signInWithEmailAndPassword(window.firebaseAuth, email, pass).then((userCredential) => {
        if (email === "er.arunbanjare@gmail.com" || email === "admin@learncad.com") {
            showAdminPanel();
        } else {
            window.firebaseGet(window.firebaseChild(window.firebaseRef(window.firebaseDB), 'users/' + userCredential.user.uid)).then(snapshot => {
                currentStudentUser = snapshot.exists() ? snapshot.val() : { username: email.split('@')[0], id: userCredential.user.uid, email };
                currentStudentUser.id = userCredential.user.uid;
                document.getElementById('admin-panel').classList.add('hidden');
                document.getElementById('main-website').classList.add('hidden');
                document.getElementById('auth').classList.add('hidden');
                document.getElementById('student-dashboard').classList.remove('hidden');
                document.getElementById('welcome-user').innerText = "Welcome, " + currentStudentUser.username + "!";
                loadStudentDashboardData();
                document.getElementById('studentChatWidgetContainer').style.display = 'block';
                initStudentLiveChat();
                
                const chatForm = document.getElementById('student-chat-form');
                if (chatForm) {
                    chatForm.onsubmit = sendStudentChatMessage;
                }
            });
        }
    }).catch((error) => alert("Login Error: " + error.message));
}

function handleLogout() {
    window.signOutUser(window.firebaseAuth).then(() => {
        localStorage.clear();
        sessionStorage.clear();
        currentStudentUser = null;
        document.getElementById('student-dashboard').classList.add('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
        document.getElementById('main-website').classList.remove('hidden');
        document.getElementById('auth').classList.remove('hidden');
        document.getElementById('studentChatWidgetContainer').style.display = 'none';
    });
}

function handleRegistration(event) {
    event.preventDefault();
    const name = sanitizeInput(document.getElementById('reg-name').value);
    const phone = sanitizeInput(document.getElementById('reg-mobile').value);
    const email = sanitizeInput(document.getElementById('reg-email').value).toLowerCase();
    const password = document.getElementById('reg-password').value.trim();
    const course = document.getElementById('reg-course').value;
    const address = sanitizeInput(document.getElementById('reg-address').value);

    window.createUserWithEmailAndPassword(window.firebaseAuth, email, password).then((userCredential) => {
        window.firebasePush(window.firebaseRef(window.firebaseDB, 'registrations'), { name, phone, email, course, address, timestamp: new Date().toISOString() });
        window.firebaseSet(window.firebaseRef(window.firebaseDB, 'users/' + userCredential.user.uid), { username: name, email, mobile: phone, createdAt: new Date().toISOString() }).then(() => {
            alert("Account created successfully!");
            document.getElementById('student-reg-form').reset();
            toggleForm('login');
        });
    }).catch((error) => alert("Error: " + error.message));
}

// 15. Student Dashboard Tabs & Password Change
function switchStudentTab(tab) {
    currentStudentTabActive = tab;
    document.getElementById('cnav-my').classList.remove('active');
    document.getElementById('cnav-all').classList.remove('active');
    document.getElementById('cnav-settings').classList.remove('active');

    document.getElementById('sec-my-courses').classList.add('hidden');
    document.getElementById('sec-all-courses').classList.add('hidden');
    document.getElementById('sec-settings').classList.add('hidden');

    if (tab === 'my') {
        document.getElementById('cnav-my').classList.add('active');
        document.getElementById('sec-my-courses').classList.remove('hidden');
    } else if (tab === 'all') {
        document.getElementById('cnav-all').classList.add('active');
        document.getElementById('sec-all-courses').classList.remove('hidden');
    } else if (tab === 'settings') {
        document.getElementById('cnav-settings').classList.add('active');
        document.getElementById('sec-settings').classList.remove('hidden');
    }
    loadStudentDashboardData();
}

function handleStudentPasswordChange(event) {
    event.preventDefault();
    const oldPass = document.getElementById('old-pass').value.trim();
    const newPass = document.getElementById('new-pass').value.trim();
    const user = window.firebaseAuth.currentUser;

    if (!user) {
        alert("Please login again.");
        return;
    }

    const credential = window.EmailAuthProvider.credential(user.email, oldPass);
    window.reauthenticateWithCredential(user, credential).then(() => {
        window.updatePassword(user, newPass).then(() => {
            alert("Password updated successfully!");
            event.target.reset();
        }).catch((error) => {
            alert("Error updating password: " + error.message);
        });
    }).catch((error) => {
        alert("Old password is incorrect!");
    });
}

function filterStudentPill(type) {
    document.getElementById('cpill-all').classList.remove('active');
    document.getElementById('cpill-free').classList.remove('active');
    document.getElementById('cpill-paid').classList.remove('active');
    document.getElementById('cpill-' + type).classList.add('active');
    
    switchStudentTab('all');
    
    const dbRef = window.firebaseRef(window.firebaseDB);
    window.firebaseGet(window.firebaseChild(dbRef, 'user_enrollments/' + currentStudentUser.id)).then(snapshot => {
        let allCardsHtml = "";

        Object.keys(globalCoursesData).forEach(cId => {
            const c = globalCoursesData[cId];
            const isFree = c.price == 0;

            if (type === 'free' && !isFree) return;
            if (type === 'paid' && isFree) return;

            const btnText = isFree ? "Enroll for FREE (₹0)" : `Pay via Razorpay (₹${c.price})`;
            const thumbHtml = c.thumb ? `<img src="${c.thumb}" alt="${c.title}">` : c.title;

            allCardsHtml += `<div class="lms-card floating-element" data-title="${c.title.toLowerCase()}">
                <div class="lms-badge badge-free">${isFree ? 'FREE NOTES' : 'PREMIUM'}</div>
                <div class="lms-thumb">${thumbHtml}</div>
                <div class="lms-details">
                    <h3>${c.title}</h3>
                    <p style="font-size:0.85rem; color:#666; margin-bottom:12px;">${c.desc || ''}</p>
                    ${!isFree ? `<div class="coupon-box"><input type="text" id="coupon-${cId}" placeholder="Enter Coupon"><button onclick="applyCoupon('${cId}', ${c.price})">Apply</button></div>` : ''}
                    <button class="lms-btn-action lms-btn-free" id="pay-btn-${cId}" onclick="startRazorpayPayment('${cId}', ${c.price})">${btnText}</button>
                </div>
            </div>`;
        });

        if (allCardsHtml === "") allCardsHtml = `<p style="color:#666; font-size:1.05rem;">No courses found matching filter.</p>`;
        document.getElementById('student-all-grid').innerHTML = allCardsHtml;
    });
}

function filterStudentCourses() {
    const searchInput = document.getElementById('student-search-input');
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase();
    const activeGridId = currentStudentTabActive === 'my' ? 'student-enrolled-grid' : 'student-all-grid';
    const cards = document.querySelectorAll('#' + activeGridId + ' .lms-card');

    cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        card.style.display = title.includes(query) ? "" : "none";
    });
}

function loadStudentDashboardData() {
    if (!currentStudentUser || !currentStudentUser.id) return;
    const dbRef = window.firebaseRef(window.firebaseDB);
    
    window.firebaseGet(window.firebaseChild(dbRef, 'user_enrollments/' + currentStudentUser.id)).then(snapshot => {
        const enrolledIds = snapshot.exists() ? snapshot.val() : {};
        let myCardsHtml = "";
        let allCardsHtml = "";

        Object.keys(globalCoursesData).forEach(cId => {
            const c = globalCoursesData[cId];
            const isEnrolled = enrolledIds[cId] ? true : false;
            const isFree = c.price == 0;
            const thumbHtml = c.thumb ? `<img src="${c.thumb}" alt="${c.title}">` : c.title;

            if (isEnrolled) {
                myCardsHtml += `<div class="lms-card floating-element" data-title="${c.title.toLowerCase()}">
                    <div class="lms-badge">✅ Active Access</div>
                    <div class="lms-thumb">${thumbHtml}</div>
                    <div class="lms-details">
                        <h3>${c.title}</h3>
                        <p style="font-size:0.85rem; color:#666; margin-bottom:12px;">${c.desc || ''}</p>
                        <button class="lms-btn-action" onclick="openCourseMaterials('${cId}', '${c.title}')">Open Units & Lectures →</button>
                    </div>
                </div>`;
            }

            const btnText = isFree ? "Enroll for FREE (₹0)" : `Pay via Razorpay (₹${c.price})`;
            allCardsHtml += `<div class="lms-card floating-element" data-title="${c.title.toLowerCase()}">
                <div class="lms-badge badge-free">${isFree ? 'FREE NOTES' : 'PREMIUM'}</div>
                <div class="lms-thumb">${thumbHtml}</div>
                <div class="lms-details">
                    <h3>${c.title}</h3>
                    <p style="font-size:0.85rem; color:#666; margin-bottom:12px;">${c.desc || ''}</p>
                    ${!isFree ? `<div class="coupon-box"><input type="text" id="coupon-${cId}" placeholder="Enter Coupon"><button onclick="applyCoupon('${cId}', ${c.price})">Apply</button></div>` : ''}
                    <button class="lms-btn-action lms-btn-free" id="pay-btn-${cId}" onclick="startRazorpayPayment('${cId}', ${c.price})">${btnText}</button>
                </div>
            </div>`;
        });

        if (myCardsHtml === "") myCardsHtml = `<p style="color:#666; font-size:1.05rem;">Aapne abhi tak koi course unlock nahi kiya hai. Explore Courses par click karein.</p>`;

        const enrolledGrid = document.getElementById('student-enrolled-grid');
        const allGrid = document.getElementById('student-all-grid');
        if (enrolledGrid) enrolledGrid.innerHTML = myCardsHtml;
        if (allGrid) allGrid.innerHTML = allCardsHtml;
    });
}

// 16. Razorpay Payments & Coupons
let appliedDiscounts = {};

function applyCoupon(courseId, originalPrice) {
    const couponInput = document.getElementById(`coupon-${courseId}`);
    if (!couponInput) return;
    const inputVal = couponInput.value.trim().toUpperCase();
    let foundDisc = 0;

    Object.keys(globalCouponsData).forEach(cpKey => {
        const cp = globalCouponsData[cpKey];
        if (cp.code === inputVal) {
            foundDisc = cp.discount;
        }
    });

    if (foundDisc > 0) {
        let finalPrice = Math.max(0, originalPrice - foundDisc);
        appliedDiscounts[courseId] = finalPrice;
        const payBtn = document.getElementById(`pay-btn-${courseId}`);
        if(payBtn) payBtn.innerText = `Pay via Razorpay (₹${finalPrice}) [Discount Applied!]`;
        alert(`Coupon applied! New Price: ₹${finalPrice}`);
    } else {
        alert("Invalid Coupon Code!");
    }
}

function startRazorpayPayment(courseId, originalPrice) {
    const course = globalCoursesData[courseId];
    if (!course) return;

    const finalAmount = appliedDiscounts[courseId] !== undefined ? appliedDiscounts[courseId] : course.price;

    if (finalAmount == 0) {
        window.firebaseSet(window.firebaseRef(window.firebaseDB, 'user_enrollments/' + currentStudentUser.id + '/' + courseId), {
            enrolledAt: new Date().toISOString()
        }).then(() => {
            alert("Free access unlocked successfully!");
            loadStudentDashboardData();
            switchStudentTab('my');
        });
        return;
    }

    var options = {
        "key": RAZORPAY_KEY_ID,
        "amount": finalAmount * 100,
        "currency": "INR",
        "name": "Learn CAD with Er. Arun Banjare",
        "description": course.title,
        "image": "LOGO1.PNG.png",
        "handler": function (response) {
            const paymentId = response.razorpay_payment_id;
            const paidDate = new Date().toLocaleString();
            
            window.firebaseSet(window.firebaseRef(window.firebaseDB, 'user_enrollments/' + currentStudentUser.id + '/' + courseId), {
                enrolledAt: new Date().toISOString(),
                payment_id: paymentId
            }).then(() => {
                window.firebasePush(window.firebaseRef(window.firebaseDB, 'payments/razorpay'), {
                    userId: currentStudentUser.id,
                    userName: currentStudentUser.username || 'Student',
                    courseId: courseId,
                    courseTitle: course.title,
                    amount: finalAmount,
                    payment_id: paymentId,
                    paidAt: new Date().toISOString()
                });
                
                showDigitalInvoice(currentStudentUser.username || 'Student', course.title, finalAmount, paymentId, paidDate);
                loadStudentDashboardData();
                switchStudentTab('my');
            });
        },
        "prefill": {
            "name": currentStudentUser ? currentStudentUser.username : "",
            "email": currentStudentUser ? currentStudentUser.email : "",
            "contact": currentStudentUser ? currentStudentUser.mobile : ""
        },
        "theme": {
            "color": "#0056b3"
        }
    };
    
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
    });
    rzp.open();
}

function showDigitalInvoice(name, courseTitle, amount, paymentId, dateStr) {
    document.getElementById('inv-name').innerText = name;
    document.getElementById('inv-course').innerText = courseTitle;
    document.getElementById('inv-amount').innerText = "₹" + amount;
    document.getElementById('inv-payid').innerText = paymentId;
    document.getElementById('inv-date').innerText = dateStr;
    document.getElementById('invoice-modal').classList.remove('hidden');
}

function closeInvoiceModal() {
    document.getElementById('invoice-modal').classList.add('hidden');
}

// 17. Multi-Level Folders & PDF.js Secure Viewer
function openCourseMaterials(courseId, courseTitle) {
    const dbRef = window.firebaseRef(window.firebaseDB);
    window.firebaseGet(window.firebaseChild(dbRef, 'course_materials/' + courseId)).then(snapshot => {
        if (snapshot.exists()) {
            const materials = snapshot.val();
            let subjectsMap = {};

            Object.keys(materials).forEach(mId => {
                const m = materials[mId];
                const subj = m.subject || 'General Subject';
                const unit = m.unit || 'Unit 1';
                if (!subjectsMap[subj]) subjectsMap[subj] = {};
                if (!subjectsMap[subj][unit]) subjectsMap[subj][unit] = [];
                subjectsMap[subj][unit].push({ id: mId, ...m });
            });

            let listHtml = `<div style="display:flex; flex-direction:column; gap:20px; margin-top:15px;">`;
            const isAdmin = window.firebaseAuth && window.firebaseAuth.currentUser && (window.firebaseAuth.currentUser.email.toLowerCase() === "er.arunbanjare@gmail.com");

            Object.keys(subjectsMap).sort().forEach(subj => {
                listHtml += `<div style="border: 2px solid #0056b3; border-radius: 8px; padding: 15px; background: #fff;">
                    <h3 style="color: #0056b3; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">📚 Subject: ${subj}</h3>`;

                Object.keys(subjectsMap[subj]).sort().forEach(unit => {
                    listHtml += `<div style="margin-top: 10px; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #cbd5e1;">
                        <h4 style="color: #475569; margin-bottom: 6px; font-size: 1rem;">📁 ${unit}</h4>
                        <div style="display: flex; flex-direction: column; gap: 6px; padding-left: 10px;">`;

                    subjectsMap[subj][unit].forEach(m => {
                        const editBtnHtml = isAdmin ? `<button onclick="editMaterial('${courseId}', '${m.id}', '${m.subject || ''}', '${m.unit || ''}', '${m.title.replace(/'/g, "\\'")}', '${m.type}', '${m.link}')" class="btn" style="padding:4px 10px; font-size:0.75rem; background:#ffc107; color:#333; margin-left:5px;">✏️ Edit/Replace</button>` : '';
                        const deleteBtnHtml = isAdmin ? `<button onclick="deleteMaterial('${courseId}', '${m.id}', '${m.title.replace(/'/g, "\\'")}')" class="btn-del" style="margin-left:5px;">🗑️ Delete</button>` : '';

                        if (m.type === 'video') {
                            listHtml += `<div style="padding:8px; border:1px solid #e2e8f0; border-radius:6px; display:flex; justify-content:space-between; align-items:center; background:#fff;">
                                <div><b>🎥 ${m.title}</b></div>
                                <div><button onclick="playInAppVideo('${m.link}', '${m.title}')" class="btn" style="padding:5px 12px; font-size:0.8rem;">Play</button>${editBtnHtml}${deleteBtnHtml}</div>
                            </div>`;
                        } else {
                            listHtml += `<div style="padding:8px; border:1px solid #e2e8f0; border-radius:6px; display:flex; justify-content:space-between; align-items:center; background:#fff;">
                                <div><b>📄 ${m.title}</b> <span style="font-size:10px; color:#28a745; background:#e6f4ea; padding:2px 5px; border-radius:3px; margin-left:5px;">Secure View (No Download)</span></div>
                                <div><button onclick="openSecurePdfViewer('${m.link}', '${m.title}')" class="btn" style="padding:5px 12px; font-size:0.8rem; background:#17a2b8;">Read PDF</button>${editBtnHtml}${deleteBtnHtml}</div>
                            </div>`;
                        }
                    });
                    listHtml += `</div></div>`;
                });
                listHtml += `</div>`;
            });
            listHtml += `</div>`;

            document.getElementById('modal-title').innerText = courseTitle + " - Subject Folders & Units";
            document.getElementById('modal-body').innerHTML = listHtml;
            document.getElementById('media-modal').classList.remove('hidden');
        } else {
            alert("Lectures & Units will be uploaded soon!");
        }
    });
}

// PDF.js Secure Viewer Implementation
function openSecurePdfViewer(pdfUrl, title) {
    document.getElementById('modal-title').innerText = "Secure Reader: " + title;
    document.getElementById('modal-body').innerHTML = `
        <div style="text-align:right; margin-bottom:8px;">
            <small style="color:#d9534f; font-weight:600;">⚠️ Protected Notes: Downloading or sharing is disabled.</small>
        </div>
        <div id="pdf-viewer-container" style="width: 100%; height: 500px; overflow: auto; background: #525659; text-align: center; border-radius: 8px; padding: 10px;">
            <canvas id="pdf-canvas" style="max-width: 100%; box-shadow: 0 4px 15px rgba(0,0,0,0.3);"></canvas>
        </div>
        <div style="text-align: center; margin-top: 10px;">
            <button onclick="changePdfPage(-1)" class="btn" style="padding: 6px 15px;">◀ Prev</button>
            <span id="pdf-page-info" style="margin: 0 15px; font-weight: bold;">Page 1 of 1</span>
            <button onclick="changePdfPage(1)" class="btn" style="padding: 6px 15px;">Next ▶</button>
        </div>`;
    
    loadPdfWithPdfJs(pdfUrl);
}

let pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null, scale = 1.3;

function loadPdfWithPdfJs(url) {
    if (!window.pdfjsLib) {
        alert("PDF viewer loading error.");
        return;
    }
    window.pdfjsLib.getDocument(url).promise.then(function(pdfDoc_){
        pdfDoc = pdfDoc_;
        const pageInfo = document.getElementById('pdf-page-info');
        if(pageInfo) pageInfo.textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
        renderPage(pageNum);
    }).catch(function(error) {
        alert("Could not load PDF securely: " + error.message);
    });
}

function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
        const canvas = document.getElementById('pdf-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: ctx, viewport: viewport };
        const renderTask = page.render(renderContext);

        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
    const pageInfo = document.getElementById('pdf-page-info');
    if(pageInfo) pageInfo.textContent = `Page ${num} of ${pdfDoc.numPages}`;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function changePdfPage(dir) {
    if (!pdfDoc) return;
    if (dir === -1 && pageNum <= 1) return;
    if (dir === 1 && pageNum >= pdfDoc.numPages) return;
    pageNum += dir;
    queueRenderPage(pageNum);
}

function playInAppVideo(youtubeUrl, title) {
    let embedUrl = youtubeUrl;
    if (youtubeUrl.includes("watch?v=")) embedUrl = youtubeUrl.replace("watch?v=", "embed/");
    else if (youtubeUrl.includes("youtu.be/")) embedUrl = youtubeUrl.replace("youtu.be/", "www.youtube.com/embed/");

    document.getElementById('modal-title').innerText = "Playing: " + title;
    document.getElementById('modal-body').innerHTML = `<div class="video-container"><iframe src="${embedUrl}?autoplay=1" allowfullscreen allow="autoplay"></iframe></div>`;
}

function closeMediaModal() {
    document.getElementById('media-modal').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = "";
}
