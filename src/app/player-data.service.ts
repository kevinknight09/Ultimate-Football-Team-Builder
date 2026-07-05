import { Injectable } from '@angular/core';

export interface Player {
  id: string;
  name: string;
  rating: number;
  position: string;
}

export interface Era {
  id: string;
  name: string;
  players: Player[];
}

@Injectable({
  providedIn: 'root'
})
export class PlayerDataService {
  
  private eras: Era[] = [
    {
      id: 'spain_2010s',
      name: 'Spain 2010s',
      players: [
        { id: 'esp_1', name: 'Iker Casillas', rating: 93, position: 'GK' },
        { id: 'esp_2', name: 'Victor Valdes', rating: 88, position: 'GK' },
        { id: 'esp_3', name: 'Sergio Ramos', rating: 92, position: 'CB' },
        { id: 'esp_4', name: 'Gerard Pique', rating: 90, position: 'CB' },
        { id: 'esp_5', name: 'Carles Puyol', rating: 92, position: 'CB' },
        { id: 'esp_6', name: 'Jordi Alba', rating: 87, position: 'LB' },
        { id: 'esp_7', name: 'Dani Carvajal', rating: 89, position: 'RB' },
        { id: 'esp_8', name: 'Xavi', rating: 95, position: 'CM' },
        { id: 'esp_9', name: 'Andres Iniesta', rating: 94, position: 'CM' },
        { id: 'esp_10', name: 'Sergio Busquets', rating: 91, position: 'CM' },
        { id: 'esp_11', name: 'David Silva', rating: 90, position: 'CAM' },
        { id: 'esp_12', name: 'Cesc Fabregas', rating: 89, position: 'CAM' },
        { id: 'esp_13', name: 'Pedro', rating: 86, position: 'LW' },
        { id: 'esp_14', name: 'Juan Mata', rating: 87, position: 'RW' },
        { id: 'esp_15', name: 'David Villa', rating: 91, position: 'ST' },
        { id: 'esp_16', name: 'Fernando Torres', rating: 89, position: 'ST' }
      ]
    },
    {
      id: 'brazil_2000s',
      name: 'Brazil 2000s',
      players: [
        { id: 'bra_1', name: 'Dida', rating: 88, position: 'GK' },
        { id: 'bra_2', name: 'Lucio', rating: 90, position: 'CB' },
        { id: 'bra_3', name: 'Juan', rating: 86, position: 'CB' },
        { id: 'bra_4', name: 'Roberto Carlos', rating: 93, position: 'LB' },
        { id: 'bra_5', name: 'Cafu', rating: 93, position: 'RB' },
        { id: 'bra_6', name: 'Gilberto Silva', rating: 87, position: 'CM' },
        { id: 'bra_7', name: 'Ze Roberto', rating: 88, position: 'CM' },
        { id: 'bra_8', name: 'Kaka', rating: 94, position: 'CAM' },
        { id: 'bra_9', name: 'Ronaldinho', rating: 95, position: 'LW' },
        { id: 'bra_10', name: 'Rivaldo', rating: 92, position: 'RW' },
        { id: 'bra_11', name: 'Ronaldo Nazario', rating: 96, position: 'ST' },
        { id: 'bra_12', name: 'Adriano', rating: 90, position: 'ST' }
      ]
    },
    {
      id: 'italy_2000s',
      name: 'Italy 2000s',
      players: [
        { id: 'ita_1', name: 'Gianluigi Buffon', rating: 95, position: 'GK' },
        { id: 'ita_2', name: 'Fabio Cannavaro', rating: 94, position: 'CB' },
        { id: 'ita_3', name: 'Alessandro Nesta', rating: 93, position: 'CB' },
        { id: 'ita_4', name: 'Paolo Maldini', rating: 95, position: 'LB' },
        { id: 'ita_5', name: 'Gianluca Zambrotta', rating: 89, position: 'RB' },
        { id: 'ita_6', name: 'Andrea Pirlo', rating: 93, position: 'CM' },
        { id: 'ita_7', name: 'Gennaro Gattuso', rating: 89, position: 'CM' },
        { id: 'ita_8', name: 'Francesco Totti', rating: 92, position: 'CAM' },
        { id: 'ita_9', name: 'Alessandro Del Piero', rating: 91, position: 'CAM' },
        { id: 'ita_10', name: 'Mauro Camoranesi', rating: 87, position: 'RW' },
        { id: 'ita_11', name: 'Filippo Inzaghi', rating: 88, position: 'ST' },
        { id: 'ita_12', name: 'Christian Vieri', rating: 89, position: 'ST' }
      ]
    },
    {
      id: 'argentina_2020s',
      name: 'Argentina 2020s',
      players: [
        { id: 'arg_1', name: 'Emiliano Martinez', rating: 89, position: 'GK' },
        { id: 'arg_2', name: 'Cristian Romero', rating: 88, position: 'CB' },
        { id: 'arg_3', name: 'Lisandro Martinez', rating: 87, position: 'CB' },
        { id: 'arg_4', name: 'Nicolas Tagliafico', rating: 83, position: 'LB' },
        { id: 'arg_5', name: 'Nahuel Molina', rating: 84, position: 'RB' },
        { id: 'arg_6', name: 'Enzo Fernandez', rating: 87, position: 'CM' },
        { id: 'arg_7', name: 'Rodrigo De Paul', rating: 86, position: 'CM' },
        { id: 'arg_8', name: 'Alexis Mac Allister', rating: 86, position: 'CM' },
        { id: 'arg_9', name: 'Angel Di Maria', rating: 90, position: 'LW' },
        { id: 'arg_10', name: 'Lionel Messi', rating: 97, position: 'RW' },
        { id: 'arg_11', name: 'Julian Alvarez', rating: 87, position: 'ST' },
        { id: 'arg_12', name: 'Lautaro Martinez', rating: 89, position: 'ST' }
      ]
    },
    {
      id: 'france_2000s',
      name: 'France 1990s/2000s',
      players: [
        { id: 'fra_1', name: 'Fabien Barthez', rating: 88, position: 'GK' },
        { id: 'fra_2', name: 'Marcel Desailly', rating: 91, position: 'CB' },
        { id: 'fra_3', name: 'Laurent Blanc', rating: 90, position: 'CB' },
        { id: 'fra_4', name: 'Bixente Lizarazu', rating: 88, position: 'LB' },
        { id: 'fra_5', name: 'Lilian Thuram', rating: 92, position: 'RB' },
        { id: 'fra_6', name: 'Patrick Vieira', rating: 92, position: 'CM' },
        { id: 'fra_7', name: 'Emmanuel Petit', rating: 88, position: 'CM' },
        { id: 'fra_8', name: 'Zinedine Zidane', rating: 96, position: 'CAM' },
        { id: 'fra_9', name: 'Thierry Henry', rating: 94, position: 'LW' },
        { id: 'fra_10', name: 'Ludovic Giuly', rating: 85, position: 'RW' },
        { id: 'fra_11', name: 'David Trezeguet', rating: 89, position: 'ST' }
      ]
    },
    {
      id: 'portugal_2020s',
      name: 'Portugal 2020s',
      players: [
        { id: 'por_1', name: 'Diogo Costa', rating: 86, position: 'GK' },
        { id: 'por_2', name: 'Rui Patricio', rating: 83, position: 'GK' },
        { id: 'por_3', name: 'Ruben Dias', rating: 89, position: 'CB' },
        { id: 'por_4', name: 'Pepe', rating: 86, position: 'CB' },
        { id: 'por_5', name: 'Nuno Mendes', rating: 85, position: 'LB' },
        { id: 'por_6', name: 'Joao Cancelo', rating: 87, position: 'RB' },
        { id: 'por_7', name: 'Bruno Fernandes', rating: 89, position: 'CM' },
        { id: 'por_8', name: 'Vitinha', rating: 86, position: 'CM' },
        { id: 'por_9', name: 'Joao Palhinha', rating: 85, position: 'CM' },
        { id: 'por_10', name: 'Bernardo Silva', rating: 89, position: 'CAM' },
        { id: 'por_11', name: 'Rafael Leao', rating: 87, position: 'LW' },
        { id: 'por_12', name: 'Cristiano Ronaldo', rating: 92, position: 'ST' },
        { id: 'por_13', name: 'Diogo Jota', rating: 85, position: 'RW' }
      ]
    },
    {
      id: 'france_2020s',
      name: 'France 2020s',
      players: [
        { id: 'fra2_1', name: 'Mike Maignan', rating: 88, position: 'GK' },
        { id: 'fra2_2', name: 'Hugo Lloris', rating: 86, position: 'GK' },
        { id: 'fra2_3', name: 'William Saliba', rating: 88, position: 'CB' },
        { id: 'fra2_4', name: 'Raphael Varane', rating: 87, position: 'CB' },
        { id: 'fra2_5', name: 'Theo Hernandez', rating: 87, position: 'LB' },
        { id: 'fra2_6', name: 'Jules Kounde', rating: 86, position: 'RB' },
        { id: 'fra2_7', name: 'N\'Golo Kante', rating: 89, position: 'CM' },
        { id: 'fra2_8', name: 'Aurelien Tchouameni', rating: 85, position: 'CM' },
        { id: 'fra2_9', name: 'Adrien Rabiot', rating: 84, position: 'CM' },
        { id: 'fra2_10', name: 'Antoine Griezmann', rating: 90, position: 'CAM' },
        { id: 'fra2_11', name: 'Kylian Mbappe', rating: 96, position: 'LW' },
        { id: 'fra2_12', name: 'Ousmane Dembele', rating: 85, position: 'RW' },
        { id: 'fra2_13', name: 'Olivier Giroud', rating: 85, position: 'ST' },
        { id: 'fra2_14', name: 'Karim Benzema', rating: 91, position: 'ST' }
      ]
    },
    {
      id: 'argentina_1990s',
      name: 'Argentina 1990s',
      players: [
        { id: 'arg9_1', name: 'Sergio Goycochea', rating: 88, position: 'GK' },
        { id: 'arg9_2', name: 'Oscar Ruggeri', rating: 90, position: 'CB' },
        { id: 'arg9_3', name: 'Roberto Sensini', rating: 86, position: 'CB' },
        { id: 'arg9_4', name: 'Jose Chamot', rating: 85, position: 'LB' },
        { id: 'arg9_5', name: 'Javier Zanetti', rating: 92, position: 'RB' },
        { id: 'arg9_6', name: 'Diego Simeone', rating: 89, position: 'CM' },
        { id: 'arg9_7', name: 'Fernando Redondo', rating: 91, position: 'CM' },
        { id: 'arg9_8', name: 'Diego Maradona', rating: 97, position: 'CAM' },
        { id: 'arg9_9', name: 'Claudio Caniggia', rating: 88, position: 'LW' },
        { id: 'arg9_10', name: 'Ariel Ortega', rating: 87, position: 'RW' },
        { id: 'arg9_11', name: 'Gabriel Batistuta', rating: 93, position: 'ST' }
      ]
    },
    {
      id: 'germany_2010s',
      name: 'Germany 2010s',
      players: [
        { id: 'ger1_1', name: 'Manuel Neuer', rating: 92, position: 'GK' },
        { id: 'ger1_2', name: 'Jerome Boateng', rating: 87, position: 'CB' },
        { id: 'ger1_3', name: 'Mats Hummels', rating: 89, position: 'CB' },
        { id: 'ger1_4', name: 'Philipp Lahm', rating: 91, position: 'RB' },
        { id: 'ger1_5', name: 'Benedikt Howedes', rating: 84, position: 'LB' },
        { id: 'ger1_6', name: 'Bastian Schweinsteiger', rating: 90, position: 'CM' },
        { id: 'ger1_7', name: 'Sami Khedira', rating: 86, position: 'CM' },
        { id: 'ger1_8', name: 'Toni Kroos', rating: 90, position: 'CM' },
        { id: 'ger1_9', name: 'Mesut Ozil', rating: 89, position: 'CAM' },
        { id: 'ger1_10', name: 'Thomas Muller', rating: 88, position: 'RW' },
        { id: 'ger1_11', name: 'Marco Reus', rating: 87, position: 'LW' },
        { id: 'ger1_12', name: 'Miroslav Klose', rating: 89, position: 'ST' }
      ]
    },
    {
      id: 'germany_2020s',
      name: 'Germany 2020s',
      players: [
        { id: 'ger2_1', name: 'Marc-Andre ter Stegen', rating: 88, position: 'GK' },
        { id: 'ger2_2', name: 'Antonio Rudiger', rating: 87, position: 'CB' },
        { id: 'ger2_3', name: 'Jonathan Tah', rating: 83, position: 'CB' },
        { id: 'ger2_4', name: 'Joshua Kimmich', rating: 87, position: 'RB' },
        { id: 'ger2_5', name: 'David Raum', rating: 82, position: 'LB' },
        { id: 'ger2_6', name: 'Ilkay Gundogan', rating: 87, position: 'CM' },
        { id: 'ger2_7', name: 'Leon Goretzka', rating: 84, position: 'CM' },
        { id: 'ger2_8', name: 'Jamal Musiala', rating: 87, position: 'CAM' },
        { id: 'ger2_9', name: 'Florian Wirtz', rating: 86, position: 'CAM' },
        { id: 'ger2_10', name: 'Leroy Sane', rating: 84, position: 'LW' },
        { id: 'ger2_11', name: 'Serge Gnabry', rating: 83, position: 'RW' },
        { id: 'ger2_12', name: 'Kai Havertz', rating: 84, position: 'ST' },
        { id: 'ger2_13', name: 'Niclas Fullkrug', rating: 83, position: 'ST' }
      ]
    },
    {
      id: 'croatia_2010s',
      name: 'Croatia 2010s',
      players: [
        { id: 'cro_1', name: 'Danijel Subasic', rating: 83, position: 'GK' },
        { id: 'cro_2', name: 'Domagoj Vida', rating: 82, position: 'CB' },
        { id: 'cro_3', name: 'Dejan Lovren', rating: 82, position: 'CB' },
        { id: 'cro_4', name: 'Sime Vrsaljko', rating: 82, position: 'RB' },
        { id: 'cro_5', name: 'Ivan Strinic', rating: 79, position: 'LB' },
        { id: 'cro_6', name: 'Marcelo Brozovic', rating: 85, position: 'CM' },
        { id: 'cro_7', name: 'Ivan Rakitic', rating: 88, position: 'CM' },
        { id: 'cro_8', name: 'Luka Modric', rating: 92, position: 'CAM' },
        { id: 'cro_9', name: 'Ivan Perisic', rating: 86, position: 'LW' },
        { id: 'cro_10', name: 'Ante Rebic', rating: 81, position: 'RW' },
        { id: 'cro_11', name: 'Mario Mandzukic', rating: 86, position: 'ST' }
      ]
    },
    {
      id: 'netherlands_2020s',
      name: 'Netherlands 2020s',
      players: [
        { id: 'ned_1', name: 'Bart Verbruggen', rating: 81, position: 'GK' },
        { id: 'ned_2', name: 'Virgil van Dijk', rating: 89, position: 'CB' },
        { id: 'ned_3', name: 'Nathan Ake', rating: 85, position: 'CB' },
        { id: 'ned_4', name: 'Denzel Dumfries', rating: 84, position: 'RB' },
        { id: 'ned_5', name: 'Daley Blind', rating: 81, position: 'LB' },
        { id: 'ned_6', name: 'Frenkie de Jong', rating: 88, position: 'CM' },
        { id: 'ned_7', name: 'Tijjani Reijnders', rating: 82, position: 'CM' },
        { id: 'ned_8', name: 'Xavi Simons', rating: 85, position: 'CAM' },
        { id: 'ned_9', name: 'Cody Gakpo', rating: 86, position: 'LW' },
        { id: 'ned_10', name: 'Steven Bergwijn', rating: 80, position: 'RW' },
        { id: 'ned_11', name: 'Memphis Depay', rating: 83, position: 'ST' }
      ]
    },
    {
      id: 'england_2010s',
      name: 'England 2010s',
      players: [
        { id: 'eng1_1', name: 'Joe Hart', rating: 81, position: 'GK' },
        { id: 'eng1_2', name: 'Gary Cahill', rating: 81, position: 'CB' },
        { id: 'eng1_3', name: 'Phil Jagielka', rating: 79, position: 'CB' },
        { id: 'eng1_4', name: 'Kyle Walker', rating: 83, position: 'RB' },
        { id: 'eng1_5', name: 'Leighton Baines', rating: 81, position: 'LB' },
        { id: 'eng1_6', name: 'Jordan Henderson', rating: 82, position: 'CM' },
        { id: 'eng1_7', name: 'Jack Wilshere', rating: 80, position: 'CM' },
        { id: 'eng1_8', name: 'Wayne Rooney', rating: 85, position: 'CAM' },
        { id: 'eng1_9', name: 'Raheem Sterling', rating: 83, position: 'LW' },
        { id: 'eng1_10', name: 'Danny Welbeck', rating: 78, position: 'RW' },
        { id: 'eng1_11', name: 'Daniel Sturridge', rating: 82, position: 'ST' }
      ]
    },
    {
      id: 'brazil_2010s',
      name: 'Brazil 2010s',
      players: [
        { id: 'bra1_1', name: 'Julio Cesar', rating: 80, position: 'GK' },
        { id: 'bra1_2', name: 'David Luiz', rating: 83, position: 'CB' },
        { id: 'bra1_3', name: 'Dante', rating: 81, position: 'CB' },
        { id: 'bra1_4', name: 'Maicon', rating: 82, position: 'RB' },
        { id: 'bra1_5', name: 'Marcelo', rating: 85, position: 'LB' },
        { id: 'bra1_6', name: 'Luiz Gustavo', rating: 81, position: 'CM' },
        { id: 'bra1_7', name: 'Paulinho', rating: 81, position: 'CM' },
        { id: 'bra1_8', name: 'Oscar', rating: 83, position: 'CAM' },
        { id: 'bra1_9', name: 'Bernard', rating: 77, position: 'LW' },
        { id: 'bra1_10', name: 'Hulk', rating: 82, position: 'RW' },
        { id: 'bra1_11', name: 'Fred', rating: 78, position: 'ST' }
      ]
    },
    {
      id: 'italy_2010s',
      name: 'Italy 2010s',
      players: [
        { id: 'ita1_1', name: 'Salvatore Sirigu', rating: 82, position: 'GK' },
        { id: 'ita1_2', name: 'Andrea Ranocchia', rating: 78, position: 'CB' },
        { id: 'ita1_3', name: 'Davide Astori', rating: 79, position: 'CB' },
        { id: 'ita1_4', name: 'Ignazio Abate', rating: 79, position: 'RB' },
        { id: 'ita1_5', name: 'Mattia De Sciglio', rating: 77, position: 'LB' },
        { id: 'ita1_6', name: 'Riccardo Montolivo', rating: 81, position: 'CM' },
        { id: 'ita1_7', name: 'Alberto Aquilani', rating: 80, position: 'CM' },
        { id: 'ita1_8', name: 'Emanuele Giaccherini', rating: 78, position: 'CAM' },
        { id: 'ita1_9', name: 'Stephan El Shaarawy', rating: 81, position: 'LW' },
        { id: 'ita1_10', name: 'Alessio Cerci', rating: 79, position: 'RW' },
        { id: 'ita1_11', name: 'Mario Balotelli', rating: 83, position: 'ST' }
      ]
    },
    {
      id: 'spain_2020s',
      name: 'Spain 2020s',
      players: [
        { id: 'spa2_1', name: 'Unai Simon', rating: 84, position: 'GK' },
        { id: 'spa2_2', name: 'Aymeric Laporte', rating: 85, position: 'CB' },
        { id: 'spa2_3', name: 'Eric Garcia', rating: 78, position: 'CB' },
        { id: 'spa2_4', name: 'Pedro Porro', rating: 82, position: 'RB' },
        { id: 'spa2_5', name: 'Jose Gaya', rating: 82, position: 'LB' },
        { id: 'spa2_6', name: 'Pedri', rating: 86, position: 'CM' },
        { id: 'spa2_7', name: 'Gavi', rating: 84, position: 'CM' },
        { id: 'spa2_8', name: 'Dani Olmo', rating: 84, position: 'CAM' },
        { id: 'spa2_9', name: 'Ferran Torres', rating: 82, position: 'LW' },
        { id: 'spa2_10', name: 'Mikel Oyarzabal', rating: 83, position: 'RW' },
        { id: 'spa2_11', name: 'Alvaro Morata', rating: 84, position: 'ST' }
      ]
    }
  ];

  constructor() { }

  getAllEras(): Era[] {
    return this.eras;
  }
}
