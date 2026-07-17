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
