--
-- PostgreSQL database dump
--

\restrict aa450FPInnswhzdCeVeI4JEKacrGeplI4ibXZpX8VaRBhh0G11zt9jglzuGVDru

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: backend_registers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backend_registers (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT register_id_not_null NOT NULL,
    description_short character varying(100) CONSTRAINT register_description_short_not_null NOT NULL,
    description_long text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: event_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id character varying(255) NOT NULL,
    member_id uuid,
    status character varying(20) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT event_attendance_status_check CHECK (((status)::text = ANY ((ARRAY['yes'::character varying, 'maybe'::character varying, 'no'::character varying])::text[])))
);


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vorname character varying(100) NOT NULL,
    nachname character varying(100) NOT NULL,
    gmail character varying(255) NOT NULL,
    register_id uuid,
    mobil_number character varying(50),
    birthday date,
    part_of_since_year integer,
    street_name_and_house_number character varying(255),
    plz character varying(20),
    town character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Data for Name: backend_registers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.backend_registers (id, description_short, description_long, created_at) FROM stdin;
b4dfd1c8-362a-412f-b91e-d95f04b436eb	Sopran 1	Der hohe Frauenchor	2026-09-14 00:18:35.744458
70a52d09-8fca-4313-8e63-a4f2fb3b598f	Sopran 2	Der hohe Frauenchor	2026-09-14 00:18:35.744458
78615638-c6ff-4322-9e31-8f35cee483a9	Alt 1	Der tiefe Frauenchor	2026-09-14 00:18:35.744458
038ba8d3-4ca3-4664-8052-3d9023a490e4	Alt 2	Der tiefe Frauenchor	2026-09-14 00:18:35.744458
28a9a9b2-8ee1-4c4b-bc47-7fa373e87607	Tenor 1	Der hohe M├ñnnerchor	2026-09-14 00:18:35.744458
1b1ebe77-98d7-4364-a808-7f95389db925	Tenor 2	Der hohe M├ñnnerchor	2026-09-14 00:18:35.744458
984ef881-81d7-4d78-ba43-a5cd79503320	Bass 1	Der tiefe M├ñnnerchor	2026-09-14 00:18:35.744458
3e59bd8f-9e6b-4c1f-94db-cce8f3784e40	Bass 2	Der tiefe M├ñnnerchor	2026-09-14 00:18:35.744458
22031143-0e19-4b38-b1dc-236590068fdd	Dirigent	Der Chorleiter	2026-09-14 00:18:35.744458
\.


--
-- Data for Name: event_attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_attendance (id, event_id, member_id, status, updated_at) FROM stdin;
0d554170-6895-4abd-a977-61efe7473a7e	7nfcgtuajfi4i6sgchm4jdfgbc_20261009T173000Z	50d73505-0537-4ea7-9eb0-dbaa95ddf5ac	yes	2026-09-14 01:08:20.765296
5b1dd501-433a-405e-8c90-37e133575d7f	4v5tsnhdgg2d265cp3fq3v6at9	50d73505-0537-4ea7-9eb0-dbaa95ddf5ac	yes	2026-09-14 01:08:32.1875
2e9242ae-1774-4244-a21d-ec423d574e66	7nfcgtuajfi4i6sgchm4jdfgbc_20260918T173000Z	50d73505-0537-4ea7-9eb0-dbaa95ddf5ac	yes	2026-09-14 01:13:55.710912
a9965214-37ec-4f5f-a9b0-0436a7332b3c	7nfcgtuajfi4i6sgchm4jdfgbc_20260925T173000Z	50d73505-0537-4ea7-9eb0-dbaa95ddf5ac	maybe	2026-09-14 01:14:06.139581
d0abb859-09ac-4a69-955b-dbb597b8b7b8	7nfcgtuajfi4i6sgchm4jdfgbc_20261002T173000Z	50d73505-0537-4ea7-9eb0-dbaa95ddf5ac	yes	2026-09-14 01:14:10.964373
7dcb054c-608f-4fef-b0d3-31056a4ebd52	7nfcgtuajfi4i6sgchm4jdfgbc_20261023T173000Z	50d73505-0537-4ea7-9eb0-dbaa95ddf5ac	maybe	2026-09-14 01:14:17.19805
2210034d-fa04-467f-abba-559aa78f4d86	6752obqi9gd7ggrsngi8uico5d	50d73505-0537-4ea7-9eb0-dbaa95ddf5ac	yes	2026-09-14 07:28:24.468956
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.members (id, vorname, nachname, gmail, register_id, mobil_number, birthday, part_of_since_year, street_name_and_house_number, plz, town, created_at) FROM stdin;
50d73505-0537-4ea7-9eb0-dbaa95ddf5ac	Rolf	Wiechert	rolf.wiechert2025@gmail.com	22031143-0e19-4b38-b1dc-236590068fdd	+49 1575 2429035	1971-06-10	2011	Heideweg 2	72160	Horb am Neckar	2026-09-14 00:26:38.375512
89262adb-9036-4b8b-966c-82f8b28d8ccc	Julia	Wiechert Voss	anna.schmidt.vocal@gmail.com	b4dfd1c8-362a-412f-b91e-d95f04b436eb	+49 171 9876543	1990-07-26	2011	Heideweg 2	72160	Horb am Neckar	2026-09-14 00:26:38.375512
376583ea-b75e-4e9d-b64f-98dbb4a202c2	Maria	Weber	maria.weber.alt@gmail.com	78615638-c6ff-4322-9e31-8f35cee483a9	+49 172 5554433	1978-11-03	2022	Schillerstra├ƒe 8	72160	Horb am Neckar	2026-09-14 00:26:38.375512
1f4d40eb-ff9a-4397-92d8-7f30c7be9707	Stefan	M├╝ller	stefan.mueller.bass@gmail.com	984ef881-81d7-4d78-ba43-a5cd79503320	+49 173 3332211	1975-02-19	2020	Bahnhofstra├ƒe 15	72160	Horb am Neckar	2026-09-14 00:26:38.375512
\.


--
-- Name: event_attendance event_attendance_event_id_member_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendance
    ADD CONSTRAINT event_attendance_event_id_member_id_key UNIQUE (event_id, member_id);


--
-- Name: event_attendance event_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendance
    ADD CONSTRAINT event_attendance_pkey PRIMARY KEY (id);


--
-- Name: members members_gmail_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_gmail_key UNIQUE (gmail);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: backend_registers register_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.backend_registers
    ADD CONSTRAINT register_pkey PRIMARY KEY (id);


--
-- Name: idx_event_attendance_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_attendance_event ON public.event_attendance USING btree (event_id);


--
-- Name: idx_event_attendance_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_attendance_member ON public.event_attendance USING btree (member_id);


--
-- Name: idx_members_gmail; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_members_gmail ON public.members USING btree (gmail);


--
-- Name: idx_members_register_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_members_register_id ON public.members USING btree (register_id);


--
-- Name: idx_register_short; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_register_short ON public.backend_registers USING btree (description_short);


--
-- Name: event_attendance event_attendance_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendance
    ADD CONSTRAINT event_attendance_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: members members_register_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_register_id_fkey FOREIGN KEY (register_id) REFERENCES public.backend_registers(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict aa450FPInnswhzdCeVeI4JEKacrGeplI4ibXZpX8VaRBhh0G11zt9jglzuGVDru

