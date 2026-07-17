# Pramit Portfolio — Spring Boot Conversion Changelog

## What Changed and Why

---

## Phase 1: `pom.xml` — Downgrade & Fix Dependencies

**Why**: Spring Boot 4.1.0 and Java 25 are unreleased/bleeding-edge. Vercel doesn't support them. Downgraded to stable versions.

### Spring Boot Version
| | Before | After |
|---|--------|-------|
| Spring Boot | `4.1.0` | `3.4.5` |
| Java | `25` | `21` |

### Dependencies Changed
| Artifact | Before | After | Reason |
|----------|--------|-------|--------|
| `spring-boot-starter-web` | `spring-boot-starter-webmvc` | `spring-boot-starter-web` | `webmvc` is a 4.x-only artifact. `web` is the correct 3.x name |
| Test starter | `spring-boot-starter-thymeleaf-test` + `spring-boot-starter-webmvc-test` | `spring-boot-starter-test` | Both old artifacts don't exist in 3.x. Replaced with standard test starter |
| Mail starter | (none) | `spring-boot-starter-mail` | New — needed for `JavaMailSender` to send emails |
| Validation starter | (none) | `spring-boot-starter-validation` | New — needed for `@NotBlank`, `@Email` annotations if added later |

### Build Plugins
| Plugin | Before | After | Reason |
|--------|--------|-------|--------|
| `native-maven-plugin` | Present | Removed | GraalVM native image not needed for Vercel deployment |

---

## Phase 2: Move Static Assets

**Why**: Organize files into proper subdirectories (`css/`, `js/`, `images/`) so Thymeleaf paths are clean and standard.

| File | Before Path | After Path |
|------|-------------|------------|
| `style.css` | `static/style.css` | `static/css/style.css` |
| `script.js` | `static/script.js` | `static/js/script.js` |
| `pramit.png` | `static/pramit.png` | `static/images/pramit.png` |
| `pramit 2.jpg` | `static/pramit 2.jpg` | `static/images/pramit-2.jpg` |
| `project-research.jpg` | `static/project-research.jpg` | `static/images/project-research.jpg` |
| `project-audio.jpg` | `static/project-audio.jpg` | `static/images/project-audio.jpg` |
| `project-cinema.jpg` | `static/project-cinema.jpg` | `static/images/project-cinema.jpg` |
| `project-library.jpg` | `static/project-library.jpg` | `static/images/project-library.jpg` |
| `project-portfolio.jpg` | `static/project-portfolio.jpg` | `static/images/project-portfolio.jpg` |
| `resume.pdf` | `static/resume.pdf` | `static/resume.pdf` (no move) |

**Note**: `pramit 2.jpg` was renamed to `pramit-2.jpg` to remove the space in the filename.

---

## Phase 3: `application.properties`

**Why**: Add mail server config for contact form email sending. Add `server.port` for Vercel (Vercel sets the `$PORT` env var).

### Before
```properties
spring.application.name=meet pramit springboot
```

### After
```properties
spring.application.name=meet pramit springboot

server.port=${PORT:8080}

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

- `server.port=${PORT:8080}` — Vercel provides `$PORT` env var. Falls back to 8080 locally.
- Mail credentials use `${ENV_VAR:}` syntax — reads from environment variables. Empty default so app starts without them locally.

---

## Phase 4: Java Files (3 New Files)

**Why**: Add a controller to handle page routes, a model for the contact form, and a service to send emails via Gmail SMTP.

### 4a. `model/ContactMessage.java` — NEW

**Path**: `src/main/java/com/example/meet_pramit_springboot/model/ContactMessage.java`

**Why**: Simple Java object to hold contact form data. Spring auto-binds HTML form fields to this object via `@ModelAttribute`.

```java
package com.example.meet_pramit_springboot.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ContactMessage {
    private String name;
    private String email;
    private String message;
}
```

### 4b. `service/EmailService.java` — NEW

**Path**: `src/main/java/com/example/meet_pramit_springboot/service/EmailService.java`

**Why**: Sends email using Spring's `JavaMailSender`. When someone submits the contact form, this service builds a simple text email and sends it to your Gmail.

```java
package com.example.meet_pramit_springboot.service;

import com.example.meet_pramit_springboot.model.ContactMessage;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(ContactMessage contact) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo("pramitdutta04@gmail.com");
        msg.setFrom("pramitdutta04@gmail.com");
        msg.setReplyTo(contact.getEmail());
        msg.setSubject("Portfolio Contact: " + contact.getName());
        msg.setText("From: " + contact.getName() + " (" + contact.getEmail() + ")\n\n" + contact.getMessage());
        mailSender.send(msg);
    }
}
```

### 4c. `controller/HomeController.java` — NEW

**Path**: `src/main/java/com/example/meet_pramit_springboot/controller/HomeController.java`

**Why**: Handles two routes:
- `GET /` — serves the portfolio page (`index.html` via Thymeleaf)
- `POST /contact-submit` — receives form data, sends email, redirects back to contact section

```java
package com.example.meet_pramit_springboot.controller;

import com.example.meet_pramit_springboot.model.ContactMessage;
import com.example.meet_pramit_springboot.service.EmailService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class HomeController {

    private final EmailService emailService;

    public HomeController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @PostMapping("/contact-submit")
    public String submitContact(@ModelAttribute ContactMessage contact) {
        emailService.sendEmail(contact);
        return "redirect:/#contact";
    }
}
```

### 4d. `MeetPramitSpringbootApplication.java` — NO CHANGE

---

## Phase 5: `templates/index.html`

**Why**: Convert plain HTML to Thymeleaf template. Add Thymeleaf namespace, convert all `../static/` paths to `th:href`/`th:src` syntax, and add `name` attributes to form fields for Spring binding.

### All Changes (16 edits)

| Line | Before | After | Why |
|------|--------|-------|-----|
| 2 | `<html lang="en">` | `<html lang="en" xmlns:th="https://thymeleaf.org">` | Enable Thymeleaf expressions |
| 11 | `href="../static/style.css"` | `th:href="@{/css/style.css}"` | Thymeleaf asset path (CSS moved to `css/`) |
| 29 | `src="../static/pramit.png"` | `th:src="@{/images/pramit.png}"` | Thymeleaf asset path (moved to `images/`) |
| 56 | `src="../static/pramit%202.jpg"` | `th:src="@{/images/pramit-2.jpg}"` | Thymeleaf path + renamed file |
| 283 | `src="../static/project-research.jpg"` | `th:src="@{/images/project-research.jpg}"` | Thymeleaf path |
| 301 | `src="../static/project-audio.jpg"` | `th:src="@{/images/project-audio.jpg}"` | Thymeleaf path |
| 320 | `src="../static/project-cinema.jpg"` | `th:src="@{/images/project-cinema.jpg}"` | Thymeleaf path |
| 339 | `src="../static/project-library.jpg"` | `th:src="@{/images/project-library.jpg}"` | Thymeleaf path |
| 356 | `src="../static/project-portfolio.jpg"` | `th:src="@{/images/project-portfolio.jpg}"` | Thymeleaf path |
| 392 | `href="../static/resume.pdf"` | `th:href="@{/resume.pdf}"` | Thymeleaf path |
| 393 | `href="../static/resume.pdf"` | `th:href="@{/resume.pdf}"` | Thymeleaf path |
| 443 | `<form ... id="contactForm">` | `<form ... id="contactForm" action="/contact-submit" method="post">` | Point form to Spring controller |
| 446 | `<input ... id="name" ...>` | `<input ... id="name" name="name" ...>` | `name` attribute for `@ModelAttribute` binding |
| 450 | `<input ... id="email" ...>` | `<input ... id="email" name="email" ...>` | `name` attribute for `@ModelAttribute` binding |
| 454 | `<textarea id="message" ...>` | `<textarea id="message" name="message" ...>` | `name` attribute for `@ModelAttribute` binding |
| 539 | `src="../static/script.js"` | `th:src="@{/js/script.js}"` | Thymeleaf path (moved to `js/`) |

**Everything else unchanged**: All sections (hero, about, skills, education, projects, resume, contact info, footer, navbar, Pikachu, circle menu) — identical content.

---

## Phase 6: `static/js/script.js`

**Why**: Remove the Formspree JavaScript handler. The form now submits traditionally via HTML `action="/contact-submit" method="post"`, so the JS fetch to Formspree is no longer needed.

### Deleted (lines 325-379)
```javascript
/* ── Send Message ── */
(function() {
  const form = document.getElementById('contactForm');
  // ... entire Formspree handler ...
})();
```

**Everything else unchanged**: Snow particles, navbar, theme toggle, Konami code, PDF viewer, text scramble animation, timeline scroll, Pikachu, circle menu, scroll animations — all identical.

---

## Phase 7: `vercel.json` — NEW

**Why**: Tells Vercel how to build and find the Spring Boot JAR.

```json
{
  "buildCommand": "./mvnw clean package -DskipTests",
  "outputDirectory": "target"
}
```

---

## Phase 8: Cleanup

| Action | File | Why |
|--------|------|-----|
| Deleted | `templates/pdf-test.html` | Test page no longer needed |
| Edited | `.gitignore` | Added `.env` to prevent accidental credential commits |

---

## Files Summary

| # | File | Action |
|---|------|--------|
| 1 | `pom.xml` | Edited |
| 2 | `src/main/resources/application.properties` | Edited |
| 3 | `src/main/java/.../model/ContactMessage.java` | Created |
| 4 | `src/main/java/.../service/EmailService.java` | Created |
| 5 | `src/main/java/.../controller/HomeController.java` | Created |
| 6 | `src/main/resources/templates/index.html` | Edited (16 changes) |
| 7 | `src/main/resources/static/js/script.js` | Edited (1 section deleted) |
| 8 | `src/main/resources/static/css/style.css` | Moved (no edit) |
| 9 | 7 image files | Moved to `static/images/` |
| 10 | `vercel.json` | Created |
| 11 | `templates/pdf-test.html` | Deleted |
| 12 | `.gitignore` | Edited |
