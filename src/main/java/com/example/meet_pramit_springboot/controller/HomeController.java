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
