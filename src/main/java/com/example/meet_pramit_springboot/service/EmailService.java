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
